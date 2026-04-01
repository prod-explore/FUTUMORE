require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Mailgun = require('mailgun.js');
const MailgunFormData = require('form-data');


const app = express();
const PORT = 3000; // port wewnątrz kontenera
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});
const mailgun = new Mailgun(MailgunFormData);
const mgClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.eu.mailgun.net"
});


// Middleware
app.use(cors({
  origin: "https://futumore.pl",
  methods: ["POST"],
})); // pozwala na połączenia z innych usług w sieci Docker
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Endpoint
app.post(
  '/api/contact',
  [
    // Walidacja danych
    body('name')
      .trim()
      .notEmpty().withMessage('Imię i nazwisko jest wymagane')
      .isLength({ max: 100 }).withMessage('Imię i nazwisko może mieć max 100 znaków'),

    body('email')
      .trim()
      .notEmpty().withMessage('Email jest wymagany')
      .isEmail().withMessage('Niepoprawny adres email'),

    body('description')
      .trim()
      .notEmpty().withMessage('Opis oczekiwań jest wymagany')
      .isLength({ max: 2000 }).withMessage('Opis może mieć max 2000 znaków'),

    body('phone')
      .optional({ checkFalsy: true })
      .isMobilePhone('pl-PL').withMessage('Niepoprawny numer telefonu'),

    body('schedule.type')
      .notEmpty().withMessage('Typ terminu jest wymagany')
      .isIn(['preset', 'custom']).withMessage('Niepoprawny typ terminu'),

    body('schedule.date')
      .notEmpty().withMessage('Data spotkania jest wymagana')
      .isISO8601().withMessage('Niepoprawny format daty'),

    body('schedule.time')
      .optional({ checkFalsy: true })
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Niepoprawny format godziny'),
  ],
  async (req, res) => {
    // Sprawdzenie błędów walidacji
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const formData = req.body;

    console.log('Otrzymano poprawne dane z formularza:', formData);

    // Wysyłka maila

    try {
    // Wysyłka maila k+futu
      await mgClient.messages.create('mg.futumore.pl', {
        from: 'FUTUMORE <no-reply@mg.futumore.pl>', // nadawca
        to: formData.email,           // odbiorca
        bcc: ["milosz.webdev@gmail.com", "explore.wrld.wrld@gmail.com"],
        subject: `Przyszłość rozwoju twojej działalności jest już w naszych rękach! Dziękujemy za zgłoszenie ${formData.name}` ,
        html: `
          <html>
            <body style="margin:0; padding:0; background-color:#000000; font-family:Arial, sans-serif; color:#ffffff;">
              <div style="max-width:600px; margin:0 auto; padding:20px;">
                <div style="text-align:center; margin-bottom:30px;">
                <img src="https://futumore.pl/img/logo-white.png" alt="Futumore" width="150" />
                </div>
                <h2 style="color:#00c8ff;">Dziękujemy za zgłoszenie ${formData.name}!</h2>
                <p>Nasz zespół właśnie zapoznaje się z Twoimi oczekiwaniami, aby zagwarantować najlepszą jakość usług. Wkrótce skontaktujemy się z Tobą, aby potwierdzić termin spotkania.</p>
                <h3 style="color:#00c8ff; margin-top:30px;">Twoje usługi:</h3>
                <ul>
                   ${formData.services.map(s => `<li>${s.label}</li>`).join('')}
                </ul>
                <h3 style="color:#00c8ff;">Opis:</h3>
                <p>${formData.description}</p>
                <p style="margin-top:30px; font-size:12px; color:#888888;">
                  Nie odpowiadaj na tego maila. W przypadku potrzeby pilnego kontaktu prosimy o telefon na numer <strong>+48733685937</strong>
                </p>
              </div>
            </body>
          </html>
      `,
      "h:Auto-Submitted": "auto-generated",
      "h:Precedence": "bulk",
      });

        res.json({ status: 'ok', message: 'Formularz odebrany i mail wysłany' });

    } catch (err) {
      console.error('Błąd przy wysyłce maila:', err);
      res.status(500).json({ status: 'error', message: 'Nie udało się wysłać maila' });
    }
  }
);


// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Backend działa na porcie ${PORT}`);
});
