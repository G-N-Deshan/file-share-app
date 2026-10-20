const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const fileRoutes = require('./routes/upload');
const listRoutes = require('./routes/list');
const filesByCodeRoutes = require('./routes/filesByCode');
const fileActionsRoutes = require('./routes/files');

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(config.uploadDir));

// API routes
app.use('/api', fileRoutes);
app.use('/api', listRoutes);
app.use('/api', filesByCodeRoutes);

// File preview & download routes (/files/:id and /download/:id)
app.use('/', fileActionsRoutes);

// Health check
app.get(['/api/health', '/healthz'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend build if present (for single-service deployment)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/files') ||
      req.path.startsWith('/download') ||
      req.path.startsWith('/uploads')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser.`);
});

// Automated 90-day cleanup runs on startup and once every 24 hours
const cleanup = require('./scripts/cleanup');
cleanup();
setInterval(cleanup, 24 * 60 * 60 * 1000);
