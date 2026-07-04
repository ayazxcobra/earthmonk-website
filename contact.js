// routes/contact.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages sent. Please try again later.' },
});

const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 80 }).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[0-9+\-\s()]{7,15}$/),
  body('message').trim().isLength({ min: 5, max: 1000 }).escape(),
];

// Public: send a contact message.
router.post('/', contactLimiter, contactValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, phone, message } = req.body;
  db.prepare(`
    INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)
  `).run(name, email, phone || null, message);

  res.status(201).json({ message: 'Thanks - we will get back to you soon.' });
});

// Admin only: read messages.
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
  res.json(rows);
});

module.exports = router;
