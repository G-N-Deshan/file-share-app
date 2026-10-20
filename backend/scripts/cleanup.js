const path = require('path');
const fs = require('fs');
const { db } = require('../models/fileModel');

// Delete files older than 90 days
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function cleanup() {
  const cutoff = new Date(Date.now() - NINETY_DAYS_MS).toISOString();
  db.all('SELECT * FROM files WHERE uploaded_at < ?', [cutoff], (err, rows) => {
    if (err) {
      console.error('Cleanup query error:', err);
      return;
    }
    if (!rows || rows.length === 0) {
      return;
    }
    rows.forEach(file => {
      const filePath = path.join(__dirname, '..', 'uploads', file.path);
      fs.unlink(filePath, unlinkErr => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          console.error('Failed to delete file', file.path, unlinkErr);
        }
      });
    });
    // Remove DB records
    const ids = rows.map(r => r.id);
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      db.run(`DELETE FROM files WHERE id IN (${placeholders})`, ids, delErr => {
        if (delErr) console.error('Failed to delete DB rows', delErr);
        else console.log(`[Auto-cleanup] Purged ${ids.length} files older than 90 days`);
      });
    }
  });
}

module.exports = cleanup;

if (require.main === module) {
  cleanup();
}
