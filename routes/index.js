const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');
const transporter = require('../mailer.js');

const receiverEmail = process.env.receiver_email;


router.get('/', (req, res) => {
  res.sendFile(path.join(global.appRoot, 'public', 'Papa\ Dons', 'calendar.html'));
});

router.post('/', (req, res) => {
  const {title, date, starttime, endtime, description} = req.body
  const stmt = db.prepare(`
    INSERT INTO events (title, date, starttime, endtime, description, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(title, date, starttime, endtime, description, 'pending')
  res.send('data saved');
  transporter.sendMail({
    from: '"Scott" <scottlynnfwa@gmail.com>',
    to: receiverEmail,
    subject: "Event Pending ✔",
    text: "Client has submitted an event request awaiting approval",
  });
  transporter.sendMail({
    from: '"Scott" <scottlynnfwa@gmail.com>',
    to: receiverEmail,
    subject: "Request Submitted ✔",
    text: "Your event was submitted successfully and is pending approval",
  });
});

router.get('/retrieve', (req, res) => {
  const rows = db.prepare("SELECT * FROM events WHERE status='approved' ORDER BY date, starttime").all();
  res.json(rows);
});



module.exports = router;