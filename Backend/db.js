const Database = require('better-sqlite3');
const cron = require('node-cron');

// This creates or opens the database file
const db = new Database('./data/data.db');

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
    status TEXT
  )
`).run();

function deleteOldRecords() {
  const query = `DELETE FROM events WHERE date < datetime('now', '-30 days')`;

  try {
    const result = db.prepare(query).run();
    console.log(`Deleted ${result.changes} rows older than 30 days`);
  } catch (err) {
    console.error('Error deleting old records:', err.message);
  }
}

// Schedule task to run every day at 2:00 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running daily cleanup:', new Date().toISOString());
  deleteOldRecords();
});

deleteOldRecords(); // Initial cleanup on startup

module.exports = db;