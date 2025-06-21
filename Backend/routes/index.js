const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');
const transporter = require('../mailer.js');
const xss = require('xss');


const receiverEmail = process.env.receiver_email;

router.get('/', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'landing.html'));
});

router.get('/landing.html', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'landing.html'));
});

router.get('/aboutMe.html', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'aboutMe.html'));
});

router.get('/calendar.html', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'calendar.html'));
});

router.get('/location.html', (req, res) => {
  res.sendFile(path.join(global.appRoot, '../Frontend', 'HTML', 'location.html'));
});


router.post('/', (req, res) => {
  const {title, date, starttime, endtime, location, description, type, email, user} = req.body
  const userEmail = db.prepare('SELECT * FROM users').all()[0].email;
  console.log('userEmail', userEmail);
  // validate and sanitize user input to prevent xss attacks and malformed inputs through devtools or bypassing browser
  if (isValidTime(starttime) && isValidTime(endtime) && isValidDate(date) && (type == 'public' || type == 'private')) {
    const stmt = db.prepare(`
      INSERT INTO events (title, date, starttime, endtime, location, description, email, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(xss(title), date, starttime, endtime, xss(location), xss(description), email, type, 'pending');
    res.send('data saved');
    transporter.sendMail({
      from: '"Scott" <scottlynnfwa@gmail.com>',
      to: userEmail,
      subject: "Event Pending ✔",
      text: "Client has submitted an event request and is awaiting approval",
    });
    transporter.sendMail({
      from: '"Scott" <scottlynnfwa@gmail.com>',
      to: email,
      subject: "Request Submitted ✔",
      text: "Your event was submitted successfully and is pending approval",
    });
    return;
  }
  res.send('invalid inputs')
});

router.get('/retrieve', (req, res) => {
  const rows = db.prepare("SELECT * FROM events WHERE status='approved' AND type='public' ORDER BY date, starttime").all();
  res.json(rows);
});


router.get('/schedule', (req, res) => {
  const stmt = db.prepare('SELECT * FROM weekly_schedule');
  const rows = stmt.all();
  if (rows.length > 0) {
    for (const row of rows) {
      row.times = JSON.parse(row.times); // Parse the times from JSON string to array
    }
    res.json(rows);
  } else {
    res.status(404).send('Weekly schedule not found');
  }
});

router.get('/dates', (req, res) => {
  const stmt = db.prepare('SELECT * FROM dates_available');
  const rows = stmt.all();
  if (rows.length > 0) {
    for (const row of rows) {
      row.times = JSON.parse(row.times);
    }
    res.json(rows); 
  } else {
      res.json({})
    }
  });

// helper function to validate input server side
function isValidTime(time) {
  const [first, last] = time.split(':')
  return (
    first && last &&
    first.length === 2 && last.length === 2 &&
    isNumericString(first) &&
    isNumericString(last)
  )
}

function isNumericString(str) {
  return /^[0-9]+$/.test(str);
}

function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}


module.exports = router;