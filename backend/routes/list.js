const express = require('express');
const fileModel = require('../models/fileModel');
const path = require('path');

const router = express.Router();

// GET /api/list - list all files (owner view)
router.get('/list', async (req, res) => {
  try {
    const files = await fileModel.listAllFiles();
    res.json(files);
  } catch (err) {
    console.error('List error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
