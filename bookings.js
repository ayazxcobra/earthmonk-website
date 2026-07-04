// routes/bookings.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Limit booking submissions to slow down spam/abuse (10 per 15 min per IP).
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many booking attempts. Please try again later.' },
});

const bookingValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }).escape(),
  body('phone').trim().matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Enter a valid phone number.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().normalizeEmail(),
  body('party_size').isInt({ min: 1, max: 30 }).withMessage('Party size must be between 1 and 30.'),
  body('booking_date').isISO8601().withMessage('Enter a valid date.'),
  body('booking_time').trim().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Enter a valid time (HH:MM).'),
  body('special_request').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).escape(),
];

// Public: create a booking request.
router.post('/', bookingLimiter, bookingValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, phone, email, party_size, booking_date, booking_time, special_request } = req.body;

  const stmt = db.prepare(`
    INSERT INTO bookings (name, phone, email, party_size, booking_date, booking_time, special_request)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name, phone, email || null, party_size, booking_date, booking_time, special_request || null
  );

  res.status(201).json({
    message: 'Table request received. We will confirm shortly by phone.',
    id: result.lastInsertRowid,
  });
});

// Admin only: list all bookings, most recent first.
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY id DESC').all();
  res.json(rows);
});

// Admin only: update a booking's status (confirmed / cancelled / pending).
router.patch('/:id/status', requireAdmin, (req, res) => {
  const allowed = ['pending', 'confirmed', 'cancelled'];
  const { status } = req.body;
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const result = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Booking not found.' });
  }
  res.json({ message: 'Booking updated.' });
});

module.exports = router;
