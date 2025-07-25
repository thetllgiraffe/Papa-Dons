const bcrypt = require('bcryptjs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const transporter = require('../mailer.js');
const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';


router.get('/', (req, res) => {
  const token = req.cookies.token; // Read from cookie (requires cookie-parser)

  if (!token) return res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'admin.html'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'admin.html'));
    res.redirect('/panel');
  });
});

router.post('/signup', (req, res) => {
  const { email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  try {
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashed);
    res.status(201).send('User created');
  } catch (err) {
    if (err.message.includes('Only one user allowed')) {
      res.status(400).send('Cannot create more than one user');
    } else if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).send('User with this email already exists');
    } else {
      res.status(500).send('Internal server error');
    }
  }
})

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  // Send token as HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
  });

  // Send redirect info
  res.json({ redirectTo: '/panel' });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).send('User not found');

  const resetToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // short-lived
  );
  const resetLink = `http://localhost:8080/admin?token=${resetToken}`;

  transporter.sendMail({
    from: '"Scott" <scottlynnfwa@gmail.com>',
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`
  })
  res.send(`Link sent to ${email} to reset password`);
});

router.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(400).send('User no longer exists');

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);

    return res.send('Password updated');
  } catch (err) {
    return res.status(400).send('Invalid or expired token');
  }
});

router.get('/create_account', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'admin.html'))
});
router.get('/forgot_password', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'admin.html'))
});

module.exports = router;
