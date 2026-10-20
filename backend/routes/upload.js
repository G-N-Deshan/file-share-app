const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const fileModel = require('../models/fileModel');
const config = require('../config');

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${id}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize }
});

// POST /api/upload - handles single or multiple files
router.post('/upload', upload.any(), async (req, res) => {
  try {
    const uploadedFiles = req.files;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 6-character clean alphanumeric code (e.g. 8A3F9C) or use existing code passed in body
    const accessCode = (req.body.accessCode && req.body.accessCode.trim())
      ? req.body.accessCode.trim().toUpperCase()
      : crypto.randomBytes(3).toString('hex').toUpperCase();

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const results = [];

    for (const f of uploadedFiles) {
      const fileRecord = {
        id: path.parse(f.filename).name,
        original_name: f.originalname,
        size: f.size,
        mime: f.mimetype,
        path: f.filename,
        uploaded_at: new Date().toISOString(),
        access_code: accessCode
      };

      await fileModel.createFile(fileRecord);

      results.push({
        fileId: fileRecord.id,
        name: fileRecord.original_name,
        size: fileRecord.size,
        mime: fileRecord.mime,
        previewUrl: `${baseUrl}/files/${fileRecord.id}`,
        downloadUrl: `${baseUrl}/download/${fileRecord.id}`
      });
    }

    res.status(201).json({
      accessCode,
      files: results,
      fileId: results[0].fileId,
      previewUrl: results[0].previewUrl,
      downloadUrl: results[0].downloadUrl
    });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// POST /api/upload-text - upload text or code snippets directly
router.post('/upload-text', async (req, res) => {
  try {
    const { text, filename, accessCode: inputCode } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text or code snippet cannot be empty' });
    }

    const safeFilename = (filename && filename.trim()) ? filename.trim() : 'snippet.txt';
    const id = uuidv4();
    const ext = path.extname(safeFilename) || '.txt';
    const diskFilename = `${id}${ext}`;
    const filePath = path.join(config.uploadDir, diskFilename);

    fs.writeFileSync(filePath, text, 'utf-8');
    const stats = fs.statSync(filePath);

    const accessCode = (inputCode && inputCode.trim())
      ? inputCode.trim().toUpperCase()
      : crypto.randomBytes(3).toString('hex').toUpperCase();

    const fileRecord = {
      id,
      original_name: safeFilename,
      size: stats.size,
      mime: 'text/plain',
      path: diskFilename,
      uploaded_at: new Date().toISOString(),
      access_code: accessCode
    };

    await fileModel.createFile(fileRecord);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    res.status(201).json({
      accessCode,
      files: [{
        fileId: fileRecord.id,
        name: fileRecord.original_name,
        size: fileRecord.size,
        mime: fileRecord.mime,
        previewUrl: `${baseUrl}/files/${fileRecord.id}`,
        downloadUrl: `${baseUrl}/download/${fileRecord.id}`
      }],
      fileId: fileRecord.id,
      previewUrl: `${baseUrl}/files/${fileRecord.id}`,
      downloadUrl: `${baseUrl}/download/${fileRecord.id}`
    });
  } catch (err) {
    console.error('Upload text error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
