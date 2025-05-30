const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');
const transporter = require('../mailer.js');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'secret';

const receiverEmail = process.env.receiver_email;

router.get('/', (req, res) => {
  res.send(`
    <form method="POST">
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  `);
});

router.post('/', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin/events');
  } else {
    res.send('Invalid credentials');
  }
});

function requireAdmin(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
}

router.get('/events', requireAdmin, (req, res) => {
  res.sendFile(path.join(global.appRoot, 'public', 'Papa\ Dons', 'admin.html'));
  // res.send('<h1>Welcome Admin</h1><a href="/logout">Logout</a>');
});

router.post('/list', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY date, time').all();
  res.json(rows);
});

router.put('/events', requireAdmin, (req, res) => {
  const { id, action } = req.body;
  if (action === 'approve') {
    const stmt = db.prepare('UPDATE events SET status = ? WHERE id = ?');
    stmt.run('approved', id);
    transporter.sendMail({
        from: '"Scott" <scottlynnfwa@gmail.com>',
        to: receiverEmail,
        subject: "Event Approved ✔",
        text: "Your event has been approved",
      }, (err, info) => {
        if (err) {
          console.error('Error sending email:', err);
        } else {
          console.log('Email sent:', info.response);
        }
      });
  }
  if (action === 'reject') {
    const stmt = db.prepare('UPDATE events SET status = ? WHERE id = ?');
    stmt.run('rejected', id);
    transporter.sendMail({
        from: '"Scott" <scottlynnfwa@gmail.com>',
        to: receiverEmail,
        subject: "Event Denied ✔",
        text: "Your event has been denied",
      });
  }
  res.send('Event status updated');
});

router.delete('/events', requireAdmin, (req, res) => {
  const { id } = req.body;
  const stmt = db.prepare('DELETE FROM events WHERE id = ?');
  stmt.run(id);
  res.send('Event deleted');
  transporter.sendMail({
    from: '"Scott" <scottlynnfwa@gmail.com>',
    to: receiverEmail,
    subject: "Event Removed ✔",
    text: "Your event has been removed from the shcedule",
  });
})

module.exports = router;