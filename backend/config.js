const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
  uploadDir: path.resolve(__dirname, 'uploads'),
  dbPath: path.resolve(__dirname, 'filemeta.db'),
  maxFileSize: 100 * 1024 * 1024 // 100 MB
};
