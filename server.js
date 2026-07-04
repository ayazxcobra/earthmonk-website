// server.js
// The House of Earthmonk - main server entry point.

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const bookingsRouter = require('./routes/bookings');
const contactRouter = require('./routes/contact');
const menuRouter = require('./routes/menu');
const adminRouter = require('./routes/admin');

// Fail loudly if critical secrets are missing, instead of running insecurely.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('replace_this')) {
  console.error('\nERROR: Set a real JWT_SECRET in your .env file before starting the server.');
  console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH.includes('replace_with')) {
  console.error('\nERROR: Set ADMIN_PASSWORD_HASH in your .env file before starting the server.');
  console.error('Generate one with: node scripts/hash-password.js "YourStrongPassword123!"\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: (process.env.ALLOWED_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50kb' })); // small limit blocks oversized-payload abuse

// General API rate limit as a safety net beyond the per-route limits below.
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// --- Static frontend ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API routes ---
app.use('/api/bookings', bookingsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/menu', menuRouter);
app.use('/api/admin', adminRouter);

// Friendly 404 for unknown API routes.
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Fallback: send index.html for any other route (simple multi-page site still
// works fine since each page is a real .html file served statically above;
// this only catches stray URLs).
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Generic error handler - never leak stack traces to visitors.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`The House of Earthmonk website running at http://localhost:${PORT}`);
});
