const express = require('express');
const fileModel = require('../models/fileModel');

const router = express.Router();

// GET /api/files-by-code/:code - return files for a given access code
router.get('/files-by-code/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  try {
    const files = await fileModel.getFilesByCode(code);
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'No files found for this access code' });
    }
    res.json(files);
  } catch (err) {
    console.error('files-by-code error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
