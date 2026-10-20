import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  Paper,
  Chip,
  TextField,
  Divider,
  Grid,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import FileCard, { FileItem } from './FileCard';

interface UploadResult {
  accessCode: string;
  files: Array<{
    fileId: string;
    name: string;
    size: number;
    mime: string;
    previewUrl: string;
    downloadUrl: string;
  }>;
}

export default function UploadDropzone({ onSwitchToReceive }: { onSwitchToReceive?: (code: string) => void }) {
  const [mode, setMode] = useState<'files' | 'text'>('files');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [existingCode, setExistingCode] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Text/Codelines state
  const [textContent, setTextContent] = useState('');
  const [textFilename, setTextFilename] = useState('');

  const handleAxiosError = (err: any) => {
    console.error('Upload error details:', err);
    if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else if (!err.response) {
      setError(
        'Cannot connect to the backend server! Make sure the backend server is running: run "node server.js" in the backend directory.'
      );
    } else if (err.response.status === 413) {
      setError('File is too large! Maximum allowed file size is 100 MB.');
    } else {
      setError(`Upload failed (${err.response.status}: ${err.response.statusText || 'Server Error'}).`);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setError('');
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('files', file);
    });

    if (existingCode.trim()) {
      formData.append('accessCode', existingCode.trim().toUpperCase());
    }

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        }
      });
      setResult(res.data);
    } catch (err: any) {
      handleAxiosError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadText = async () => {
    if (!textContent.trim()) {
      setError('Please type or paste some text or code lines before sending.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(50);

    try {
      const res = await axios.post('/api/upload-text', {
        text: textContent,
        filename: textFilename.trim() || 'codelines.txt',
        accessCode: existingCode.trim().toUpperCase() || undefined
      });
      setProgress(100);
      setResult(res.data);
      setTextContent('');
      setTextFilename('');
    } catch (err: any) {
      handleAxiosError(err);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024 // 100 MB
  });

  const shareableUrl = result ? `${window.location.origin}/?code=${result.accessCode}` : '';
  const qrCodeUrl = result
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareableUrl)}`
    : '';

  const copyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.accessCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const copyLink = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {!result ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff'
          }}
        >
          {/* Header & Mode Switcher */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Share Files, Documents & Codelines
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
              Transfer anything across devices in seconds • Limit 100 MB • Auto-deleted after 90 days
            </Typography>

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, newMode) => newMode && setMode(newMode)}
              sx={{
                bgcolor: '#f1f5f9',
                p: 0.5,
                borderRadius: 3,
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  border: 'none',
                  '&.Mui-selected': {
                    bgcolor: '#ffffff',
                    color: '#2563eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }
                }
              }}
            >
              <ToggleButton value="files">📁 Upload Files</ToggleButton>
              <ToggleButton value="text">📝 Paste Text / Codelines</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Mode 1: Drag & Drop Files (Taller & Bigger) */}
          {mode === 'files' ? (
            <Box
              {...getRootProps()}
              sx={{
                border: isDragActive ? '2px dashed #2563eb' : '2px dashed #94a3b8',
                bgcolor: isDragActive ? '#eff6ff' : '#f8fafc',
                borderRadius: 4,
                py: { xs: 6, sm: 8 },
                px: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#2563eb',
                  bgcolor: '#f1f5f9'
                }
              }}
            >
              <input {...getInputProps()} />
              <Box sx={{ fontSize: '3.5rem', mb: 1.5 }}>📂</Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                {isDragActive ? 'Release to upload files now!' : 'Drag & drop your files here, or click to browse'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                PDFs, Images, Code files (.py, .js, .cpp, .java), DOCX, ZIPs up to 100 MB each
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.2,
                  bgcolor: '#2563eb',
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
                }}
              >
                Browse & Select Files
              </Button>
            </Box>
          ) : (
            /* Mode 2: Large Text / Codelines Entry Area */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="medium"
                label="Filename / Title (optional)"
                placeholder="e.g. main.py, notes.txt, or lab3_solution.cpp"
                value={textFilename}
                onChange={(e) => setTextFilename(e.target.value)}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 2.5,
                    bgcolor: '#f8fafc'
                  }
                }}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 0.8 }}>
                  Enter or Paste Your Text / Codelines Below:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={10}
                  maxRows={24}
                  placeholder="Paste your code lines, notes, links, or text here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 3,
                      bgcolor: '#f8fafc',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      p: 2
                    }
                  }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                disabled={uploading || !textContent.trim()}
                onClick={handleUploadText}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  borderRadius: 2.5,
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
                }}
              >
                🚀 Send Text / Codelines →
              </Button>
            </Box>
          )}

          {/* Access Code customization - Larger text area */}
          <Box
            sx={{
              mt: 3.5,
              p: 2,
              borderRadius: 3,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <TextField
              label="Optional: Add to existing Access Code"
              placeholder="e.g. 8A3F9C"
              value={existingCode}
              onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
              inputProps={{
                style: {
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  letterSpacing: 2
                }
              }}
              sx={{
                width: { xs: '100%', sm: 300 },
                bgcolor: '#ffffff',
                borderRadius: 2
              }}
            />
            <Typography variant="body2" sx={{ color: '#64748b', flex: 1 }}>
              💡 If you want to bundle multiple uploads under the same code, type it here. Otherwise, leave it blank and we will generate a fresh code!
            </Typography>
          </Box>

          {/* Upload Progress Bar */}
          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb' }}>
                  Uploading to server...
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5, bgcolor: '#e2e8f0' }}
              />
            </Box>
          )}

          {/* Error Message Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2.5, fontSize: '0.92rem' }}>
              {error}
            </Alert>
          )}
        </Paper>
      ) : (
        /* Upload Success View with Access Code and QR */
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: '1px solid #bbf7d0',
            bgcolor: '#ffffff'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Chip label="✓ Upload Successful" color="success" sx={{ fontWeight: 800, mb: 1.5, px: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Your Secret Access Code
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Enter this code on your other laptop, phone, or tablet to access and download:
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3.5,
              bgcolor: '#f0fdf4',
              borderRadius: 3.5,
              border: '2px solid #86efac',
              mb: 3
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: 8,
                color: '#15803d',
                fontFamily: 'monospace',
                my: 1,
                userSelect: 'all',
                fontSize: { xs: '2.5rem', sm: '3.5rem' }
              }}
            >
              {result.accessCode}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={copyCode}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                  borderRadius: 2.5,
                  px: 3,
                  py: 1
                }}
              >
                {codeCopied ? '✓ Copied Code!' : '📋 Copy Access Code'}
              </Button>

              <Button
                variant="outlined"
                onClick={copyLink}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  borderColor: '#16a34a',
                  color: '#15803d'
                }}
              >
                {linkCopied ? '✓ Copied Link!' : '🔗 Copy Direct Link'}
              </Button>

              {onSwitchToReceive && (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => onSwitchToReceive(result.accessCode)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}
                >
                  View Files Now →
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 700, color: '#64748b', mb: 1 }}>
                SCAN WITH MOBILE CAMERA:
              </Typography>
              <Box
                component="img"
                src={qrCodeUrl}
                alt="QR Code"
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: 2.5,
                  border: '1px solid #e2e8f0',
                  p: 0.5,
                  bgcolor: '#fff'
                }}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#334155' }}>
                Uploaded in this batch:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {result.files.map((f) => {
                  const item: FileItem = {
                    id: f.fileId,
                    original_name: f.name,
                    size: f.size,
                    mime: f.mime,
                    uploaded_at: new Date().toISOString(),
                    access_code: result.accessCode
                  };
                  return <FileCard key={f.fileId} file={item} />;
                })}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => {
                setResult(null);
                setExistingCode('');
                setTextContent('');
                setTextFilename('');
              }}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b', fontSize: '0.95rem' }}
            >
              + Upload Another File or Code Snippet
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
