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
  res.sendFile(path.join(global.appRoot, 'admin', 'admin.html'));
  // res.send('<h1>Welcome Admin</h1><a href="/logout">Logout</a>');
});

router.post('/list', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY date, starttime').all();
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

router.put('/events/edit', requireAdmin, (req, res) => {
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

router.get('/schedule/weekly', requireAdmin, (req, res) => {
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

router.put('/schedule/weekly', requireAdmin, (req, res) => {
  const { day, times } = req.body;
  const stmt = db.prepare(`
    UPDATE weekly_schedule
    SET times = ? WHERE day = ?
  `);
  stmt.run(JSON.stringify(times), day);;
  res.send('Weekly schedule saved');
})

module.exports = router;