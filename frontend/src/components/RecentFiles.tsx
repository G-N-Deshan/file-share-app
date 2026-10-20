import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Paper,
  Button,
  Grid
} from '@mui/material';
import FileCard, { FileItem } from './FileCard';

export default function RecentFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/list');
      setFiles(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load recent uploads from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Recent Active Files on Server
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            All files stored on your server (auto-deleted after 90 days).
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={loadFiles}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          🔄 Refresh
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : files.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No files uploaded yet. Switch to the <strong>Upload</strong> tab to upload your first file!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {files.map((file) => (
            <Grid item xs={12} sm={6} key={file.id}>
              <FileCard file={file} showCodeBadge={true} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
