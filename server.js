/* ═══════════════════════════════════════════════════════════════
   FUTUMORE — Server (Security-Hardened v2)
   Static file serving + Contact form API (Resend)
   ═══════════════════════════════════════════════════════════════ */

const express      = require('express');
const path         = require('path');
const helmet       = require('helmet');
const cors         = require('cors');
const compression  = require('compression');
const rateLimit    = require('express-rate-limit');
const crypto       = require('crypto');
const sanitizeHtml = require('sanitize-html');
const { Resend }   = require('resend');
const { Webhook }  = require('svix');

/* ─── CONFIG ────────────────────────────────────────────────── */
const PORT                  = process.env.PORT || 3000;
const RESEND_API_KEY        = process.env.RESEND_API_KEY;
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;
const EMAIL_TO              = process.env.EMAIL_TO   || 'futumore.solutions@gmail.com';
const EMAIL_FROM            = process.env.EMAIL_FROM || 'FUTUMORE <onboarding@resend.dev>';
const CORS_ORIGIN           = process.env.CORS_ORIGIN || 'https://futumore.pl';
const NODE_ENV              = process.env.NODE_ENV   || 'development';
const TRUST_PROXY           = parseInt(process.env.TRUST_PROXY, 10) || 1;

/* ─── STARTUP VALIDATION ────────────────────────────────────── */
if (!RESEND_WEBHOOK_SECRET) {
    console.error('FATAL: RESEND_WEBHOOK_SECRET is not set. Refusing to start.');
    process.exit(1);
}

/* ─── HONEYPOT CONFIG ───────────────────────────────────────── */
const HONEYPOT_FIELD     = 'website';
const MIN_SUBMIT_TIME_MS = 3000;

/* ─── APP SETUP ─────────────────────────────────────────────── */
const app = express();

// Trust proxy (behind reverse proxy)
app.set('trust proxy', TRUST_PROXY);

// Disable X-Powered-By (don't reveal Express)
app.disable('x-powered-by');

/* ─── SECURITY HEADERS (Helmet) ─────────────────────────────── */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",                         // needed for inline scripts
                // 'unsafe-eval' removed — use 'wasm-unsafe-eval' for WASM only
                "'wasm-unsafe-eval'",
                "https://cdn.jsdelivr.net",
                "https://fonts.googleapis.com",
                "https://www.gstatic.com",
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://www.google.com",
                "https://*.gstatic.com",
                "https://wspinanie.ue.futumore.pl",
                "https://studio.hypnagogia.pl",
            ],
            workerSrc:      ["'self'", "blob:"],
            connectSrc:     ["'self'", "https://www.gstatic.com"],  // data: removed
            mediaSrc:       ["'self'"],
            objectSrc:      ["'none'"],
            frameSrc:       ["'none'"],
            baseUri:        ["'self'"],
            formAction:     ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: { policy: 'credentialless' },  // was: false
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
        maxAge: 31536000,                          // 1 year
        includeSubDomains: true,
        preload: true,
    },
}));

// Additional Permissions-Policy header
app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );
    next();
});

// Gzip compression
app.use(compression());

// CORS — restricted to production domain
app.use(cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
}));

// JSON body parser — strict limit + rawBody for webhook verification
app.use(express.json({ 
    limit: '10kb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString('utf8');
    }
}));

/* ─── REQUEST LOGGING + ID ──────────────────────────────────── */
app.use((req, res, next) => {
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    const start = Date.now();
    const originalEnd = res.end;

    res.end = function (...args) {
        const duration = Date.now() - start;
        const log = `[${requestId.slice(0, 8)}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

        if (res.statusCode >= 400) {
            console.warn(log);
        } else {
            console.log(log);
        }

        originalEnd.apply(this, args);
    };

    next();
});

/* ─── RATE LIMITING ─────────────────────────────────────────── */

// Global rate limit — prevent DDoS
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 300,                        // 300 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Zbyt wiele żądań. Spróbuj ponownie później.' },
});
app.use(globalLimiter);

// Contact form — strict limit
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 5,                          // 5 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Zbyt wiele wiadomości. Spróbuj ponownie za 15 minut.' },
});

// Inbound email webhook limit
const inboundLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 50,                         // max 50 forwarded emails per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Zbyt wiele żądań webhook.' },
});

/* ─── RESEND CLIENT ─────────────────────────────────────────── */
let resend = null;
if (RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
    console.log('✓ Resend client initialized');
} else {
    console.warn('⚠ RESEND_API_KEY not set — contact form will log to console only');
}

/* ─── STATIC FILES (Frontend) ───────────────────────────────── */
app.use(express.static(path.join(__dirname, 'FUTUMORE'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    dotfiles: 'deny',               // block .env, .git, etc.
    index: 'index.html',
}));

/* ─── SECURITY HELPERS ──────────────────────────────────────── */

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/** Sanitize input: trim + strip null bytes and control characters */
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\0/g, '');
}

/**
 * SSRF guard — only allow fetching from Resend CDN/API domains
 */
function isSafeResendUrl(url) {
    try {
        const u = new URL(url);
        return u.protocol === 'https:' &&
            (u.hostname.endsWith('.resend.com') || u.hostname === 'resend.com');
    } catch { return false; }
}

/**
 * Sanitize HTML from external email bodies.
 * Strips scripts, tracking pixels, dangerous attributes — keeps basic formatting.
 */
function sanitizeEmailBody(html) {
    return sanitizeHtml(html, {
        allowedTags: [
            'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span', 'a', 'hr', 'small',
        ],
        allowedAttributes: {
            'a':  ['href', 'title'],
            '*':  ['style'],
        },
        allowedSchemes: ['https', 'mailto'],
        disallowedTagsMode: 'discard',
    });
}

/* ─── API ROUTES ────────────────────────────────────────────── */

// Health check — minimal info (no internal state exposed)
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Contact form
app.post('/api/contact', contactLimiter, (req, res, next) => {
    if (!req.is('application/json'))
        return res.status(415).json({ error: 'Unsupported Media Type.' });
    next();
}, async (req, res) => {
    try {
        // ── Honeypot check (silent reject) ──
        if (req.body[HONEYPOT_FIELD]) {
            // Bot detected — fake success response (don't reveal detection)
            console.warn(`[HONEYPOT] Bot detected from ${req.ip} — honeypot field filled`);
            return res.json({ success: true, message: 'Wiadomość wysłana.' });
        }

        // ── Timing check (anti-bot) ──
        const formTimestamp = parseInt(req.body._t, 10);
        if (formTimestamp && (Date.now() - formTimestamp) < MIN_SUBMIT_TIME_MS) {
            console.warn(`[TIMING] Bot detected from ${req.ip} — form submitted too fast`);
            return res.json({ success: true, message: 'Wiadomość wysłana.' });
        }

        // ── Sanitize all inputs ──
        const name = sanitizeInput(req.body.name);
        const email = sanitizeInput(req.body.email);
        const phone = sanitizeInput(req.body.phone);
        const company = sanitizeInput(req.body.company || '');
        const message = sanitizeInput(req.body.message);

        // ── Validation ──
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                error: 'Wypełnij wszystkie wymagane pola (name, email, phone, message).',
            });
        }

        if (name.length > 200) {
            return res.status(400).json({ error: 'Nieprawidłowe imię.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 254) {
            return res.status(400).json({ error: 'Nieprawidłowy adres email.' });
        }

        if (phone.length > 30) {
            return res.status(400).json({ error: 'Nieprawidłowy numer telefonu.' });
        }

        if (company.length > 200) {
            return res.status(400).json({ error: 'Nieprawidłowa nazwa firmy.' });
        }

        if (message.length > 5000) {
            return res.status(400).json({ error: 'Wiadomość jest za długa (max 5000 znaków).' });
        }

        // ── Build email (server-side only — all fields escaped) ──
        const emailData = {
            from: EMAIL_FROM,
            to: [EMAIL_TO],
            subject: `Nowy Lead: ${escapeHtml(name)} — ${escapeHtml(company) || 'Brak firmy'}`,
            replyTo: email,
            html: buildEmailHTML({
                name: escapeHtml(name),
                email: escapeHtml(email),
                company: escapeHtml(company),
                phone: escapeHtml(phone),
                message: escapeHtml(message),
            }),
        };

        // ── Send ──
        if (resend) {
            const { data, error } = await resend.emails.send(emailData);

            if (error) {
                console.error('Resend error:', error);
                return res.status(500).json({ error: 'Błąd wysyłki. Spróbuj ponownie.' });
            }

            console.log(`✓ Email sent: ${data.id} — ${name} <${email}>`);
        } else {
            // Fallback: log to console when no API key
            console.log('── Contact form submission (no Resend key) ──');
            console.log(JSON.stringify({ name, email, phone, company, message }, null, 2));
        }

        res.json({ success: true, message: 'Wiadomość wysłana.' });

    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
    }
});

// Inbound email webhook (Resend)
// Receives mail sent to @hello.futumore.pl → forwards to futumore.solutions@gmail.com
app.post('/api/webhooks/resend', inboundLimiter, async (req, res) => {
    try {
        // ── Signature verification (always required — startup blocks if secret missing) ──
        try {
            const wh = new Webhook(RESEND_WEBHOOK_SECRET);
            wh.verify(req.rawBody, {
                'svix-id':        req.headers['svix-id'],
                'svix-timestamp': req.headers['svix-timestamp'],
                'svix-signature': req.headers['svix-signature'],
            });
        } catch (err) {
            console.error('[INBOUND] Invalid signature:', err.message);
            return res.status(400).json({ error: 'Invalid signature.' });
        }

        const { type, data } = req.body;
        if (type !== 'email.received' || !data?.email_id) {
            return res.status(200).json({ message: 'Ignored.' });
        }

        console.log(`[INBOUND] ${data.subject || '(no subject)'} ← ${data.from}`);
        if (!resend) return res.status(500).json({ error: 'Resend not initialized.' });

        // ── Fetch full email body (retry up to 3x — Resend eventual consistency) ──
        let fullEmail = data;
        try {
            let fetchResponse;
            for (let attempt = 1; attempt <= 3; attempt++) {
                fetchResponse = await fetch(
                    `https://api.resend.com/emails/receiving/${data.email_id}`,
                    { headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` } }
                );
                if (fetchResponse.ok || fetchResponse.status !== 404) break;
                await new Promise(r => setTimeout(r, 1500 * attempt));
            }
            if (fetchResponse?.ok) {
                fullEmail = await fetchResponse.json();
                console.log(`[INBOUND] Body fetched (html: ${!!fullEmail.html}, attachments: ${(fullEmail.attachments || []).length})`);
            } else {
                console.warn(`[INBOUND] Body fetch failed (${fetchResponse?.status}) — metadata only`);
            }
        } catch (e) {
            console.warn('[INBOUND] Body fetch exception:', e.message);
        }

        // ── Build forwarded email ──
        const originalTo     = Array.isArray(data.to) ? data.to.join(', ') : (data.to || '');
        const forwardSubject = `[Fwd: ${originalTo}] ${data.subject || '(brak tematu)'}`;

        // Sanitize inbound HTML — strips scripts, tracking pixels, dangerous attrs
        let body;
        if (fullEmail.html) {
            body = sanitizeEmailBody(fullEmail.html);
        } else if (fullEmail.text) {
            body = `<pre style="white-space:pre-wrap;font-family:sans-serif;line-height:1.6">${escapeHtml(fullEmail.text)}</pre>`;
        } else {
            body = '<p style="color:#999;font-style:italic">(brak treści — sprawdź załączniki)</p>';
        }

        const forwardHtml = `
<div style="padding:16px;background:#f5f5f5;border-bottom:1px solid #ddd;margin-bottom:16px;font-family:sans-serif;color:#333;font-size:14px">
  <p style="margin:0 0 4px"><strong>Od:</strong> ${escapeHtml(data.from)}</p>
  <p style="margin:0 0 4px"><strong>Do:</strong> ${escapeHtml(originalTo)}</p>
  <p style="margin:0 0 4px"><strong>Temat:</strong> ${escapeHtml(data.subject || '')}</p>
  <p style="margin:0"><strong>Data:</strong> ${escapeHtml(data.created_at || '')}</p>
</div>
<div style="font-family:sans-serif;padding:0 16px">${body}</div>`;

        // ── Download and forward attachments (SSRF-guarded) ──
        const forwardAttachments = [];
        for (const att of (fullEmail.attachments || data.attachments || [])) {
            try {
                const filename = att.filename || att.name || 'załącznik';

                let downloadUrl = att.download_url || null;
                if (!downloadUrl && att.id) {
                    const r = await fetch(
                        `https://api.resend.com/emails/receiving/${data.email_id}/attachments/${att.id}`,
                        { headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` } }
                    );
                    if (r.ok) downloadUrl = (await r.json()).download_url || null;
                }

                // SSRF guard — only fetch from Resend domains
                if (!isSafeResendUrl(downloadUrl)) {
                    console.warn(`[INBOUND] Blocked unsafe attachment URL: ${downloadUrl}`);
                    continue;
                }

                const r = await fetch(downloadUrl);
                if (r.ok) {
                    forwardAttachments.push({
                        filename,
                        content:      Buffer.from(await r.arrayBuffer()),
                        content_type: att.content_type || 'application/octet-stream',
                    });
                    console.log(`[INBOUND] Attachment: ${filename}`);
                } else {
                    console.warn(`[INBOUND] Attachment download failed for ${filename}: ${r.status}`);
                }
            } catch (e) {
                console.error('[INBOUND] Attachment error:', e.message);
            }
        }

        // ── Forward ──
        const { data: sendData, error: sendError } = await resend.emails.send({
            from:        EMAIL_FROM,
            to:          EMAIL_TO,
            replyTo:     data.from,
            subject:     forwardSubject,
            html:        forwardHtml,
            attachments: forwardAttachments.length > 0 ? forwardAttachments : undefined,
        });

        if (sendError) {
            console.error('[INBOUND] Forward failed:', sendError);
            return res.status(500).json({ error: 'Forward failed.' });
        }

        console.log(`✓ Forwarded (ID: ${sendData.id}) — ${data.from} → ${EMAIL_TO}`);
        res.status(200).json({ success: true });

    } catch (err) {
        console.error('[INBOUND] Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

/* ─── CATCH UNDEFINED API ROUTES ────────────────────────────── */
app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint nie istnieje.' });
});

/* ─── SERVICE LANDING PAGES ─────────────────────────────────── */
const SERVICE_PAGES = ['systems', 'ai', 'smart-space', 'hardware'];

SERVICE_PAGES.forEach(page => {
    app.get(`/services/${page}`, (_req, res) => {
        res.sendFile(path.join(__dirname, 'FUTUMORE', 'services', `${page}.html`));
    });
});

/* ─── SPA FALLBACK ──────────────────────────────────────────── */
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'FUTUMORE', 'index.html'));
});

/* ─── GLOBAL ERROR HANDLER ──────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    const requestId = req.requestId || 'unknown';
    console.error(`[${requestId}] Unhandled error:`, err);

    res.status(err.status || 500).json({
        error: NODE_ENV === 'production'
            ? 'Wewnętrzny błąd serwera.'
            : err.message,
    });
});

/* ─── START SERVER ──────────────────────────────────────────── */
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════╗
║  FUTUMORE Server (Hardened)              ║
║  http://0.0.0.0:${PORT}                     ║
║  Resend: ${resend ? 'ACTIVE ✓' : 'INACTIVE (no API key)'}          ║
║  CORS:   ${CORS_ORIGIN.toString().slice(0, 28).padEnd(28)}   ║
║  Env:    ${NODE_ENV.padEnd(28)}   ║
╚══════════════════════════════════════════╝
    `.trim());
});

/* ─── GRACEFUL SHUTDOWN ─────────────────────────────────────── */
function gracefulShutdown(signal) {
    console.log(`\n⚠ ${signal} received — shutting down gracefully...`);

    server.close(() => {
        console.log('✓ HTTP server closed');
        process.exit(0);
    });

    // Force shutdown after 10s if connections hang
    setTimeout(() => {
        console.error('✗ Forced shutdown — timeout exceeded');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled rejections/exceptions
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

/* ─── EMAIL TEMPLATE ────────────────────────────────────────── */
function buildEmailHTML({ name, email, company, phone, message }) {
    // All fields are ALREADY escaped via escapeHtml() before calling this
    const formattedMessage = message.replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#050505; font-family:'Inter',Arial,sans-serif;">
    <div style="max-width:600px; margin:0 auto; padding:40px 24px;">
        <div style="text-align:center; margin-bottom:32px;">
            <h1 style="font-size:22px; color:#ffffff; margin:0; letter-spacing:2px;">FUTUMORE</h1>
            <p style="color:#666; font-size:13px; margin:8px 0 0;">Nowy lead z formularza kontaktowego</p>
        </div>
        <div style="background:rgba(255,255,255,0.03); padding:28px; border-radius:16px; border:1px solid rgba(255,255,255,0.06);">
            <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="padding:10px 0; color:#666; font-size:13px; width:100px; vertical-align:top;">Imię</td>
                    <td style="padding:10px 0; color:#fff; font-size:15px;">${name}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666; font-size:13px; vertical-align:top;">Email</td>
                    <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#fff; font-size:15px;">${email}</a></td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666; font-size:13px; vertical-align:top;">Telefon</td>
                    <td style="padding:10px 0; color:#fff; font-size:15px;">${phone}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666; font-size:13px; vertical-align:top;">Firma</td>
                    <td style="padding:10px 0; color:#fff; font-size:15px;">${company || '—'}</td>
                </tr>
            </table>
            <hr style="border:none; border-top:1px solid rgba(255,255,255,0.06); margin:16px 0;">
            <p style="color:#666; font-size:13px; margin:0 0 8px;">Wiadomość</p>
            <p style="color:#ccc; font-size:15px; line-height:1.7; margin:0;">${formattedMessage}</p>
        </div>
        <p style="margin-top:24px; font-size:11px; color:#444; text-align:center;">
            Wysłano z formularza futumore.com · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}
        </p>
    </div>
</body>
</html>`;
}
