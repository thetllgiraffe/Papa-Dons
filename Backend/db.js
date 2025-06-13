const Database = require('better-sqlite3');
const cron = require('node-cron');

// This creates or opens the database file
const db = new Database('./data/data.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    resetToken TEXT,
    resetTokenExpiry INTEGER
  )
`).run();

// Optional: create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    starttime TEXT NOT NULL,
    endtime TEXT NOT NULL,
    location TEXT,
    description TEXT,
    type TEXT,
    status TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS weekly_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL UNIQUE,
    times TEXT NOT NULL
  )`).run();

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const insert = db.prepare(`
  INSERT INTO weekly_schedule (day, times)
  VALUES (?, '[["09:00", "17:00"]]')
  ON CONFLICT(day) DO NOTHING
`);

for (const day of daysOfWeek) {
  insert.run(day);
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS dates_available (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    times TEXT NOT NULL
  )`).run();

function deleteOldEvents() {
  const query = `DELETE FROM events WHERE date < datetime('now', '-30 days')`;

  try {
    const result = db.prepare(query).run();
    console.log(`Deleted ${result.changes} rows older than 30 days`);
  } catch (err) {
    console.error('Error deleting old records:', err.message);
  }
}

function deleteOldAvailableDates() {
  const query = `DELETE FROM dates_available WHERE date < datetime('now', '-1 days')`;
  try {
    const result = db.prepare(query).run();
    console.log(`Deleted ${result.changes} rows older than 1 days`);
  } catch (err) {
    console.error('Error deleting old records:', err.message);
  }
}

// Schedule task to run every day at 2:00 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running daily cleanup:', new Date().toISOString());
  deleteOldEvents();
  deleteOldAvailableDates();
});

deleteOldEvents(); // Initial cleanup on startup
deleteOldAvailableDates(); // Initial cleanup on startup

module.exports = db;