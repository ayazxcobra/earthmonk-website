// routes/admin.js
// Handles admin login/logout. There is only one admin account, configured
// entirely through environment variables - no admin credentials are ever
// stored in the database or in source code.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Slow down brute-force login attempts: 8 tries per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

router.post(
  '/login',
  loginLimiter,
  [body('username').trim().notEmpty(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const { username, password } = req.body;

    const validUsername = username === process.env.ADMIN_USERNAME;
    // Always run bcrypt.compare even on a bad username, so response timing
    // doesn't reveal whether the username was correct.
    const hashToCheck = process.env.ADMIN_PASSWORD_HASH || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
    const validPassword = await bcrypt.compare(password, hashToCheck);

    if (!validUsername || !validPassword) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.cookie('admin_token', token, {
      httpOnly: true, // JavaScript on the page can't read it - blocks XSS token theft
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // blocks the cookie being sent from other sites (CSRF protection)
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ message: 'Signed in.' });
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ message: 'Signed out.' });
});

// Lets the admin dashboard check "am I still logged in?" on page load.
router.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});

module.exports = router;
