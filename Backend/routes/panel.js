const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const path = require('path');
const db = require('../db');
const transporter = require('../mailer.js');
const jwt = require('jsonwebtoken');
const isProduction = process.env.NODE_ENV === 'production';



const receiverEmail = process.env.receiver_email;


function authenticateToken(req, res, next) {
  const token = req.cookies.token; // Read from cookie (requires cookie-parser)

  if (!token) return res.sendStatus(401); // No token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user; // Attach user data to request
    next();
  });
}

router.get('/', authenticateToken, (req, res) => {
  res.sendFile(path.join(global.appRoot, 'panel', 'panel.html'));
});

router.post('/signout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
  });
  res.send('Signed out');
});

router.post('/list', authenticateToken, (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY date, starttime').all();
  res.json(rows);
});

router.put('/events', authenticateToken, (req, res) => {
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

router.put('/events/edit', authenticateToken, (req, res) => {
  const { id, title, date, starttime, endtime, location, description ,type } = req.body;
  const stmt = db.prepare('UPDATE events SET title = ?, date = ?, starttime = ?, endtime = ?, location = ?, description = ?, type = ? WHERE id = ?');
  stmt.run(title, date, starttime, endtime, location, description, type, id);
  transporter.sendMail({
      from: '"Scott" <scottlynnfwa@gmail.com>',
      to: receiverEmail,
      subject: "Event Updated ✔",
      text: "Your event has been updated",
    }, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  res.send('Event updated');
});

router.delete('/events', authenticateToken, (req, res) => {
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

router.get('/schedule/weekly', authenticateToken, (req, res) => {
  const day = req.query.day;
  const stmt = db.prepare('SELECT * FROM weekly_schedule WHERE day = ?');
  const row = stmt.get(day);
  console.log(row);
  if (row) {
    try {
      row.times = JSON.parse(row.times);  // <-- parse here
    } catch (e) {
      row.times = [];
    }
    res.json(row);
  } else {
    res.status(404).send('Weekly schedule not found');
  }
});

router.put('/schedule/weekly', authenticateToken, (req, res) => {
  const { day, times } = req.body;
  const stmt = db.prepare(`
    UPDATE weekly_schedule
    SET times = ? WHERE day = ?
  `);
  stmt.run(JSON.stringify(times), day);;
  res.send('Weekly schedule saved');
})

router.put('/schedule/dates', authenticateToken, (req, res) => {
  const { date, times } = req.body;
  const stmt = db.prepare(`
    INSERT INTO dates_available (date, times)
    VALUES (?, ?)
    ON CONFLICT(date) DO UPDATE SET times = excluded.times
  `);
  stmt.run(date, JSON.stringify(times));
  res.send('Date and time saved');
})

router.get('/schedule/dates', authenticateToken, (req, res) => {
  const rows = db.prepare('SELECT * FROM dates_available ORDER BY date').all();
    for (const row of rows) {
      try {
        row.times = JSON.parse(row.times); // Parse the times from JSON string to array
      } catch (e) {
        row.times = [];
      }
    }
    res.json(rows);
})

router.delete('/schedule/dates', authenticateToken, (req, res) => {
  const { date } = req.body;
  const stmt = db.prepare('DELETE FROM dates_available WHERE date = ?');
  stmt.run(date);
  res.send('Date deleted');
});

module.exports = router;
