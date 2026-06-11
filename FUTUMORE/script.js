/* ═══════════════════════════════════════════════════════════════
   FUTUMORE — Main Script
   Animations · Counters · Form · Particles · Carousel · i18n
   ═══════════════════════════════════════════════════════════════ */

(() => {
    'use strict';

    /* ─── CONFIGURATION ──────────────────────────────────────── */
    const CONFIG = {
        RESEND_ENDPOINT: '/api/contact',
        EMAIL_TO: 'futumore.solutions@gmail.com', // mailto: fallback only
        PARTICLE_COUNT: 80,
        COUNTER_DURATION: 2000,
        NAV_SCROLL_THRESHOLD: 50,
    };

    /* ─── i18n TRANSLATIONS ──────────────────────────────────── */
    const TRANSLATIONS = {
        en: {
            // Nav
            nav_solutions: 'Solutions',
            nav_results: 'Results',
            nav_portfolio: 'Portfolio',
            nav_process: 'Process',
            nav_cta: 'Book a Call',
            // Hero
            hero_badge: 'Business IT Solutions',
            hero_title_1: 'Aggregating your business',
            hero_title_2: 'into the future',
            hero_subtitle: 'We design and implement technologies that become a real lever for your company\'s growth. We automate processes, optimize costs, and deliver systems that scale business based on hard data.',
            hero_cta_primary: 'Book a Free Call',
            hero_cta_secondary: 'See Solutions',
            scroll: 'Scroll',
            // Solutions
            solutions_tag: 'What We Build',
            solutions_title_1: 'Your Problem,',
            solutions_title_2: 'Our Solution',
            solutions_desc: "You're losing time and money on things that could work for you. You're losing customers due to lack of communication and an intuitive sales platform. We build technology that optimizes your company's costs and processes — tailored, not off-the-shelf.",
            sol1_title: 'Sites, Systems & Apps',
            sol1_desc: 'Comprehensive web systems with integrations — bookings, calendar, orders, payment gateways, CRM, process automation. Everything tailored to your business.',
            sol1_stat: 'Full business digitization',
            sol2_title: 'AI Brain',
            sol2_desc: 'A private AI brain for your company. Agent systems, knowledge automation, integration with business processes. Your company thinks faster than the competition.',
            sol2_stat: 'Intelligence at your fingertips',
            sol3_title: 'Smart Space',
            sol3_desc: 'Intelligent infrastructure for home and office. AI monitoring, access control, IoT sensors, central dashboard — full control over your space.',
            sol3_stat: 'A space that thinks for you',
            sol4_title: 'Custom Hardware',
            sol4_desc: 'Custom-made physical gadgets — NFC business cards, restaurant buzzers, locker cards, custom LED lights, company neons. 3D printing + ESP32.',
            sol4_stat: 'Hardware that stands out',
            // Results
            results_tag: 'Proof',
            results_title_1: 'Numbers Speak',
            results_title_2: 'For Themselves',
            results_desc: "We don't just talk about success — we create it, starting with a coherent vision.",
            stat1_label: 'Projects Delivered',
            stat2_label: 'Clients Still With Us',
            stat3_label: 'Client Revenue Growth',
            stat4_label: 'Faster & Cheaper',
            feat1_title: 'Constant Communication',
            feat1_desc: "We work in continuous contact mode. You're up to date with every project milestone — no surprises, full transparency.",
            feat2_title: 'Custom-Tailored',
            feat2_desc: "Every solution is designed specifically for your company and its processes. No templates, no compromises — only what you truly need.",
            feat3_title: 'Post-Launch Support',
            feat3_desc: "We don't disappear after project delivery. Monitoring, maintenance and evolution — your product grows with your business.",
            // Portfolio
            portfolio_tag: 'Portfolio',
            portfolio_title_1: 'Trusted By',
            portfolio_title_2: 'Innovators',
            portfolio_desc: 'From startups to established companies — our solutions power businesses that think about the future.',
            // Process
            process_tag: 'How We Work',
            process_title_1: 'From Idea to',
            process_title_2: 'Finished Product',
            process_desc: 'Simple path, zero unnecessary bureaucracy. We talk, we build, we deliver. You stay in the loop the entire time.',
            step1_title: 'Project Consultation',
            step1_desc: 'We schedule an online call where we jointly define the expected project outcome, its scope and all functionalities. No obligations — this is the time for deep understanding of your vision.',
            step1_time: 'Free consultation',
            step2_title: 'Project Development',
            step2_desc: 'We begin immediate work in continuous contact mode with a deeper understanding of your needs. We discuss progress, adjust details and refine the final result together.',
            step2_time: 'Continuous contact',
            step3_title: 'Finished Product',
            step3_desc: "When both sides consider the project ready — we publish the system and launch. We don't disappear — we stay with you so your product grows with your business.",
            step3_time: 'Launch & support',
            // CTA
            cta_title_1: 'Ready For Technology That',
            cta_title_2: 'Works For You?',
            cta_desc: "Book a free consultation. No obligations, no pressure — just a conversation about your vision and the possibilities we can create together.",
            // Form
            form_name: 'Full Name',
            form_company: 'Company',
            form_optional: '(optional)',
            form_phone: 'Phone Number',
            form_message: 'Briefly describe your project',
            form_submit: 'Book Free Consultation',
            // Footer
            footer_tagline: 'IT Solutions<br>tailored to your business.',
            footer_col1_title: 'Solutions',
            footer_link1: 'Sites, Systems & Apps',
            footer_link2: 'AI Brain',
            footer_link3: 'Smart Space',
            footer_link4: 'Custom Hardware',
            footer_col2_title: 'Company',
            footer_link5: 'Portfolio',
            footer_link6: 'How We Work',
            footer_link7: 'Contact',
            footer_col3_title: 'Contact',
            footer_link8: 'Book a Call',
            footer_rights: 'All rights reserved.',
            footer_privacy: 'Privacy Policy',
            footer_terms: 'Terms of Service',
            // Form status messages
            form_error_required: 'Please fill in all required fields.',
            form_error_email: 'Please enter a valid email address.',
            form_success: '✓ Your message has been sent. We\'ll be in touch within 24 hours.',
            form_success_mailto: '✓ Opening your email client... If it doesn\'t open, email us at futumore.solutions@gmail.com',
            form_error_generic: 'Something went wrong. Please email us directly at futumore.solutions@gmail.com',
        },
        pl: {
            // Form status messages (PL defaults — rest is in the HTML)
            form_error_required: 'Wypełnij wszystkie wymagane pola.',
            form_error_email: 'Podaj poprawny adres email.',
            form_success: '✓ Wiadomość wysłana. Odezwiemy się w ciągu 24 godzin.',
            form_success_mailto: '✓ Otwieramy klienta poczty... Jeśli się nie otworzy, napisz do nas na futumore.solutions@gmail.com',
            form_error_generic: 'Coś poszło nie tak. Napisz do nas bezpośrednio na futumore.solutions@gmail.com',
        },
    };

    /* ─── STATE ──────────────────────────────────────────────── */
    let currentLang = 'pl';
    const originalTexts = new Map(); // stores original PL innerHTML

    /* ─── DOM READY ──────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initHeroParticles();
        initScrollAnimations();
        initCounters();
        initBarAnimations();
        initProcessLine();
        initContactForm();
        initCurrentYear();
        initSmoothScroll();
        initLanguageToggle();
        initProjectsCarousel();
        initCustomScrollbar();
    });

    /* ═══════════════════════════════════════════════════════════
       LANGUAGE TOGGLE (PL ↔ EN)
       ═══════════════════════════════════════════════════════════ */
    function initLanguageToggle() {
        const toggle = document.getElementById('lang-toggle');
        if (!toggle) return;

        // Store all original PL texts
        document.querySelectorAll('[data-i18n]').forEach(el => {
            originalTexts.set(el.getAttribute('data-i18n'), el.innerHTML);
        });

        // Check URL param or localStorage
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        const savedLang = localStorage.getItem('futumore-lang');
        if (urlLang === 'en' || savedLang === 'en') {
            switchLanguage('en');
        }

        toggle.addEventListener('click', () => {
            const newLang = currentLang === 'pl' ? 'en' : 'pl';
            switchLanguage(newLang);
            localStorage.setItem('futumore-lang', newLang);
        });
    }

    function switchLanguage(lang) {
        currentLang = lang;
        const html = document.documentElement;
        html.setAttribute('lang', lang);

        // Toggle swapped class on the lang button for animation
        const toggle = document.getElementById('lang-toggle');
        if (toggle) {
            if (lang === 'en') {
                toggle.classList.add('swapped');
            } else {
                toggle.classList.remove('swapped');
            }
            toggle.title = lang === 'pl' ? 'Switch to English' : 'Przełącz na Polski';
        }

        if (lang === 'en') {
            // Apply EN translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (TRANSLATIONS.en[key]) {
                    el.innerHTML = TRANSLATIONS.en[key];
                }
            });
            // Update placeholders
            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const companyInput = document.getElementById('contact-company');
            const phoneInput = document.getElementById('contact-phone');
            const messageInput = document.getElementById('contact-message');
            if (nameInput) nameInput.placeholder = 'John Doe';
            if (emailInput) emailInput.placeholder = 'john@company.com';
            if (companyInput) companyInput.placeholder = 'Company Inc.';
            if (phoneInput) phoneInput.placeholder = '+1 000 000 000';
            if (messageInput) messageInput.placeholder = 'I need a system that...';
        } else {
            // Restore original PL texts
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (originalTexts.has(key)) {
                    el.innerHTML = originalTexts.get(key);
                }
            });
            // Restore PL placeholders
            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const companyInput = document.getElementById('contact-company');
            const phoneInput = document.getElementById('contact-phone');
            const messageInput = document.getElementById('contact-message');
            if (nameInput) nameInput.placeholder = 'Jan Kowalski';
            if (emailInput) emailInput.placeholder = 'jan@firma.pl';
            if (companyInput) companyInput.placeholder = 'Nazwa Firmy';
            if (phoneInput) phoneInput.placeholder = '+48 000 000 000';
            if (messageInput) messageInput.placeholder = 'Potrzebuję systemu, który...';
        }

        // Re-render project cards for i18n
        const projectsContainer = document.getElementById('projects-carousel');
        if (projectsContainer && projectsData.length) {
            renderProjectCards(projectsContainer, projectsData);
        }
    }

    function t(key) {
        if (currentLang === 'en' && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
        if (TRANSLATIONS.pl[key]) return TRANSLATIONS.pl[key];
        return key;
    }

    /* ═══════════════════════════════════════════════════════════
       NAVIGATION
       ═══════════════════════════════════════════════════════════ */
    function initNavigation() {
        const nav = document.getElementById('main-nav');
        const burger = document.getElementById('nav-burger');
        const links = document.getElementById('nav-links');

        if (!nav || !burger || !links) return;

        // Scroll behavior
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > CONFIG.NAV_SCROLL_THRESHOLD;
            if (isScrolled) {
                nav.classList.add('nav--scrolled');
            } else {
                nav.classList.remove('nav--scrolled');
            }
            document.body.classList.toggle('is-scrolled', isScrolled);
        }, { passive: true });

        // Mobile menu toggle
        burger.addEventListener('click', () => {
            const isActive = burger.classList.toggle('active');
            links.classList.toggle('active');
            nav.classList.toggle('menu-open');
            burger.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close menu on link click
        links.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                links.classList.remove('active');
                nav.classList.remove('menu-open');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════
       HERO PARTICLE ANIMATION (Canvas)
       ═══════════════════════════════════════════════════════════ */
    function initHeroParticles() {
        const container = document.getElementById('hero-canvas');
        if (!container) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        container.appendChild(canvas);

        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

        let particles = [];
        let mouse = { x: -1000, y: -1000 };
        let animationId;

        function resize() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }

        function createParticles() {
            particles = [];
            const count = window.innerWidth < 768 ? CONFIG.PARTICLE_COUNT / 2 : CONFIG.PARTICLE_COUNT;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1,
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                const dmx = p.x - mouse.x;
                const dmy = p.y - mouse.y;
                const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
                if (mouseDist < 150) {
                    const force = (150 - mouseDist) / 150 * 0.02;
                    p.vx += dmx * force;
                    p.vy += dmy * force;
                }

                p.vx *= 0.99;
                p.vy *= 0.99;
            });

            animationId = requestAnimationFrame(drawParticles);
        }

        document.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resize();
                createParticles();
            }, 200);
        });

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        resize();
        createParticles();
        drawParticles();

        const heroSection = document.getElementById('hero');
        if (heroSection) {
            const heroObserver = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    if (!animationId) drawParticles();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }, { threshold: 0 });
            heroObserver.observe(heroSection);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       SCROLL ANIMATIONS (Intersection Observer)
       ═══════════════════════════════════════════════════════════ */
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.anim-fade-up, .anim-reveal');
        if (!elements.length) return;

        const heroAnimElements = document.querySelectorAll('.hero .anim-fade-up');
        setTimeout(() => {
            heroAnimElements.forEach(el => el.classList.add('anim-visible'));
        }, 300);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('anim-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px',
        });

        elements.forEach(el => {
            if (!el.closest('.hero')) {
                observer.observe(el);
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════
       COUNTER ANIMATIONS
       ═══════════════════════════════════════════════════════════ */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        // Special case: target is 0 (abandoned projects)
        if (target === 0) {
            el.textContent = '0';
            return;
        }

        const duration = CONFIG.COUNTER_DURATION;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(eased * target);

            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    /* ═══════════════════════════════════════════════════════════
       STAT BAR ANIMATIONS
       ═══════════════════════════════════════════════════════════ */
    function initBarAnimations() {
        const bars = document.querySelectorAll('.result-stat__bar-fill');
        if (!bars.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = entry.target.getAttribute('data-width');
                    if (width) {
                        entry.target.style.width = width + '%';
                        entry.target.classList.add('animated');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        bars.forEach(bar => observer.observe(bar));
    }

    /* ═══════════════════════════════════════════════════════════
       PROCESS TIMELINE LINE ANIMATION
       ═══════════════════════════════════════════════════════════ */
    function initProcessLine() {
        const lineFill = document.getElementById('process-line-fill');
        const timeline = document.querySelector('.process-timeline');
        if (!lineFill || !timeline) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                lineFill.style.height = '100%';
                observer.unobserve(timeline);
            }
        }, { threshold: 0.2 });

        observer.observe(timeline);
    }

    /* ═══════════════════════════════════════════════════════════
       CONTACT FORM (Resend Integration Ready)
       ═══════════════════════════════════════════════════════════ */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const status = document.getElementById('form-status');
        const submitBtn = document.getElementById('contact-submit');
        const timestampField = document.getElementById('contact-timestamp');

        if (!form || !status || !submitBtn) return;

        // Set timestamp when form loads (anti-bot timing check)
        if (timestampField) {
            timestampField.value = Date.now().toString();
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.querySelector('#contact-name').value.trim();
            const email = form.querySelector('#contact-email').value.trim();
            const company = form.querySelector('#contact-company').value.trim();
            const phone = form.querySelector('#contact-phone').value.trim();
            const message = form.querySelector('#contact-message').value.trim();
            const website = form.querySelector('#contact-website') ? form.querySelector('#contact-website').value : '';
            const _t = timestampField ? timestampField.value : '';

            if (!name || !email || !phone || !message) {
                showStatus('error', t('form_error_required'));
                return;
            }

            if (!isValidEmail(email)) {
                showStatus('error', t('form_error_email'));
                return;
            }

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                if (CONFIG.RESEND_ENDPOINT) {
                    const response = await fetch(CONFIG.RESEND_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, company, phone, message, website, _t }),
                    });

                    if (!response.ok) throw new Error('Failed to send');

                    showStatus('success', t('form_success'));
                    form.reset();

                    // Reset timestamp for next submission
                    if (timestampField) {
                        timestampField.value = Date.now().toString();
                    }
                } else {
                    const mailtoLink = `mailto:${CONFIG.EMAIL_TO}?subject=${encodeURIComponent(`Nowy Lead: ${name}`)}&body=${encodeURIComponent(`Imię: ${name}\nEmail: ${email}\nTelefon: ${phone}\nFirma: ${company}\n\nWiadomość:\n${message}`)}`;
                    window.location.href = mailtoLink;
                    showStatus('success', t('form_success_mailto'));
                }
            } catch (err) {
                console.error('Form error:', err);
                showStatus('error', t('form_error_generic'));
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });

        function showStatus(type, msg) {
            status.className = `contact-form__status ${type}`;
            status.textContent = msg;
            status.style.display = 'block';

            if (type === 'success') {
                setTimeout(() => { status.style.display = 'none'; }, 8000);
            }
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       SMOOTH SCROLLING
       ═══════════════════════════════════════════════════════════ */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════
       UTILITY
       ═══════════════════════════════════════════════════════════ */
    function initCurrentYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* ═══════════════════════════════════════════════════════════
       DYNAMIC PROJECTS CAROUSEL (Row 2)
       ═══════════════════════════════════════════════════════════ */
    let projectsData = [];

    function initProjectsCarousel() {
        const container = document.getElementById('projects-carousel');
        if (!container) return;

        // Inline project data — used as fallback when fetch() fails (e.g. file:// protocol)
        const INLINE_PROJECTS = [
            {
                name: 'Skarpa Bytom',
                slug: 'skarpa',
                type: 'System rezerwacji',
                description: 'Platforma rejestracji uczestników z panelem zarządzania, systemem rezerwacji zajęć i zgodami RODO.',
                type_en: 'Booking System',
                description_en: 'Participant registration platform with management panel, class booking system and GDPR compliance.',
                url: null,
                favicon: 'skarpa.png',
            },
            {
                name: 'Studio Hypnagogia',
                slug: 'hypnagogia',
                type: 'Strona internetowa',
                description: 'Profesjonalna strona studia nagraniowego z formularzem kontaktowym i optymalizacją SEO.',
                type_en: 'Website',
                description_en: 'Professional recording studio website with contact form and SEO optimization.',
                url: 'https://hypnagogia.studio',
                favicon: 'hypnagogia.png',
            },
        ];

        fetch('portfolio/projects/projects.json')
            .then(res => {
                if (!res.ok) throw new Error('projects.json not found');
                return res.json();
            })
            .then(projects => {
                projectsData = projects;
                renderProjectCards(container, projectsData);
            })
            .catch(() => {
                // Fallback: use inline data (works on file:// without a server)
                projectsData = INLINE_PROJECTS;
                renderProjectCards(container, projectsData);
            });
    }

    function renderProjectCards(container, projects) {
        if (!projects.length) {
            container.closest('.carousel-wrapper--projects').style.display = 'none';
            return;
        }

        const isEn = currentLang === 'en';
        let cards = projects.map(p => buildProjectCard(p, isEn)).join('');
        
        // Wypełniamy ekran, żeby przy małej liczbie projektów (np. 2) prawa strona nie była pusta.
        // Gwarantujemy, że "bazowy" set ma co najmniej 10-12 elementów.
        if (projects.length > 0 && projects.length < 12) {
            const multiplier = Math.ceil(12 / projects.length);
            cards = cards.repeat(multiplier);
        }
        
        container.innerHTML = cards;

        // Initialize drag-to-scroll
        const wrapper = container.closest('.carousel-wrapper');
        let isDown = false;
        let startX;
        let scrollLeft;

        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            wrapper.classList.add('active');
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        });
        wrapper.addEventListener('mouseleave', () => {
            isDown = false;
            wrapper.classList.remove('active');
        });
        wrapper.addEventListener('mouseup', () => {
            isDown = false;
            wrapper.classList.remove('active');
        });
        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            wrapper.scrollLeft = scrollLeft - walk;
        });
    }

    function buildProjectCard(project, isEn) {
        const type = isEn && project.type_en ? project.type_en : project.type;
        const desc = isEn && project.description_en ? project.description_en : project.description;
        const faviconSrc = project.favicon ? (project.favicon.startsWith('http') ? project.favicon : `portfolio/projects/${project.favicon}`) : '';
        const tag = project.url
            ? `a href="${project.url}" target="_blank" rel="noopener noreferrer"`
            : 'div';
        const closeTag = project.url ? 'a' : 'div';

        return `
            <${tag} class="project-card">
                ${faviconSrc ? `<img class="project-card__favicon"
                     src="${faviconSrc}"
                     alt="${project.name}"
                     loading="lazy"
                     onerror="this.style.display='none'">` : ''}
                <div class="project-card__info">
                    <span class="project-card__name">${project.name}</span>
                    <span class="project-card__type">${type}</span>
                </div>
                <div class="project-card__tooltip">
                    <span class="project-card__tooltip-desc">${desc}</span>
                </div>
            </${closeTag}>
        `;
    }

    /* ═══════════════════════════════════════════════════════════
       CUSTOM SCROLLBAR
       ═══════════════════════════════════════════════════════════ */
    function initCustomScrollbar() {
        const scrollbar = document.createElement('div');
        scrollbar.className = 'custom-scrollbar';
        document.body.appendChild(scrollbar);

        let isDragging = false;
        let startY;
        let startScrollY;
        
        let lastScrollY = window.scrollY;
        let heat = 0; // 0.0 to 1.0

        function renderLoop() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollY = window.scrollY;

            if (documentHeight <= windowHeight) {
                scrollbar.style.display = 'none';
                requestAnimationFrame(renderLoop);
                return;
            } else {
                scrollbar.style.display = 'block';
            }

            const scrollPercentage = scrollY / (documentHeight - windowHeight);
            const thumbHeight = Math.max(windowHeight * (windowHeight / documentHeight), 40); 
            const topPosition = scrollPercentage * (windowHeight - thumbHeight);

            scrollbar.style.height = `${thumbHeight}px`;
            scrollbar.style.transform = `translateY(${topPosition}px)`;

            if (!isDragging) {
                const dy = Math.abs(scrollY - lastScrollY);
                
                if (dy > 0) {
                    // Wzrost temperatury (rozgrzewanie przy ruchu)
                    heat += dy * 0.015; 
                    if (heat > 1) heat = 1;
                } else {
                    // Spadek temperatury (stygnięcie przy braku ruchu)
                    heat -= 0.015; // to da ok. 1 sekundę płynnego stygnięcia z 1.0 do 0
                    if (heat < 0) heat = 0;
                }

                scrollbar.style.opacity = heat;
            }

            lastScrollY = scrollY;
            requestAnimationFrame(renderLoop);
        }

        requestAnimationFrame(renderLoop);

        scrollbar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startScrollY = window.scrollY;
            scrollbar.classList.add('dragging');
            document.body.style.userSelect = 'none';
            scrollbar.style.opacity = '1';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaY = e.clientY - startY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const thumbHeight = parseFloat(scrollbar.style.height);
            
            const scrollRatio = (documentHeight - windowHeight) / (windowHeight - thumbHeight);
            window.scrollTo(0, startScrollY + deltaY * scrollRatio);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                scrollbar.classList.remove('dragging');
                document.body.style.userSelect = '';
                // reset heat so it cools down normally after drag
                heat = 1;
            }
        });
    }

})();
