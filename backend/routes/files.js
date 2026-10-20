const express = require('express');
const path = require('path');
const fileModel = require('../models/fileModel');
const config = require('../config');

const router = express.Router();

// Handle preview
async function handlePreview(req, res) {
  const { id } = req.params;
  try {
    const file = await fileModel.getFileById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    const filePath = path.join(config.uploadDir, file.path);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Preview error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Handle forced download
async function handleDownload(req, res) {
  const { id } = req.params;
  try {
    const file = await fileModel.getFileById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    const filePath = path.join(config.uploadDir, file.path);
    res.download(filePath, file.original_name);
  } catch (err) {
    console.error('Download error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Support both /files/:id and /api/files/:id
router.get('/files/:id', handlePreview);
router.get('/api/files/:id', handlePreview);

// Support both /download/:id and /api/download/:id
router.get('/download/:id', handleDownload);
router.get('/api/download/:id', handleDownload);

module.exports = router;
