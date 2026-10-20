const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

const db = new sqlite3.Database(config.dbPath);

// Initialize table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    original_name TEXT,
    size INTEGER,
    mime TEXT,
    path TEXT,
    uploaded_at TEXT,
    access_code TEXT NOT NULL
  )`);
});

function createFile(file) {
  const { id, original_name, size, mime, path: filePath, uploaded_at, access_code } = file;
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO files (id, original_name, size, mime, path, uploaded_at, access_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(id, original_name, size, mime, filePath, uploaded_at, access_code, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
    stmt.finalize();
  });
}

function getFileById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM files WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getFilesByCode(accessCode) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM files WHERE access_code = ?', [accessCode], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function listAllFiles() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM files ORDER BY uploaded_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  createFile,
  getFileById,
  getFilesByCode,
  listAllFiles,
  db // exported for cleanup script
};
