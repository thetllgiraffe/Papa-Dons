const Database = require('better-sqlite3');

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

module.exports = db;