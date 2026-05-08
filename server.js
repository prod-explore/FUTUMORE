/* ═══════════════════════════════════════════════════════════════
   FUTUMORE — Server
   Static file serving + Contact form API (Resend)
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

/* ─── CONFIG ────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_TO = process.env.EMAIL_TO || 'futumore.solutions@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'FUTUMORE <onboarding@resend.dev>';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

/* ─── APP SETUP ─────────────────────────────────────────────── */
const app = express();

// Trust proxy (behind reverse proxy)
app.set('trust proxy', 1);

// Security headers — relaxed CSP for inline styles/scripts in the frontend
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// Gzip compression
app.use(compression());

// CORS
app.use(cors({ origin: CORS_ORIGIN }));

// JSON body parser
app.use(express.json({ limit: '10kb' }));

/* ─── RATE LIMITING (contact form) ──────────────────────────── */
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Zbyt wiele wiadomości. Spróbuj ponownie za 15 minut.' },
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
}));

/* ─── API ROUTES ────────────────────────────────────────────── */

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        resend: !!resend,
        timestamp: new Date().toISOString(),
    });
});

// Contact form
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, phone, company, message } = req.body;

        // ── Validation ──
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                error: 'Wypełnij wszystkie wymagane pola (name, email, phone, message).',
            });
        }

        if (typeof name !== 'string' || name.length > 200) {
            return res.status(400).json({ error: 'Nieprawidłowe imię.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Nieprawidłowy adres email.' });
        }

        if (typeof phone !== 'string' || phone.length > 30) {
            return res.status(400).json({ error: 'Nieprawidłowy numer telefonu.' });
        }

        if (typeof message !== 'string' || message.length > 5000) {
            return res.status(400).json({ error: 'Wiadomość jest za długa (max 5000 znaków).' });
        }

        // ── Build email ──
        const emailData = {
            from: EMAIL_FROM,
            to: [EMAIL_TO],
            subject: `Nowy Lead: ${name} — ${company || 'Brak firmy'}`,
            replyTo: email,
            html: buildEmailHTML({ name, email, company, phone, message }),
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

/* ─── SPA FALLBACK ──────────────────────────────────────────── */
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'FUTUMORE', 'index.html'));
});

/* ─── START SERVER ──────────────────────────────────────────── */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════╗
║  FUTUMORE Server                         ║
║  http://0.0.0.0:${PORT}                     ║
║  Resend: ${resend ? 'ACTIVE ✓' : 'INACTIVE (no API key)'}          ║
╚══════════════════════════════════════════╝
    `.trim());
});

/* ─── EMAIL TEMPLATE ────────────────────────────────────────── */
function buildEmailHTML({ name, email, company, phone, message }) {
    const escapedMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

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
            <p style="color:#ccc; font-size:15px; line-height:1.7; margin:0;">${escapedMessage}</p>
        </div>
        <p style="margin-top:24px; font-size:11px; color:#444; text-align:center;">
            Wysłano z formularza futumore.com · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}
        </p>
    </div>
</body>
</html>`;
}
