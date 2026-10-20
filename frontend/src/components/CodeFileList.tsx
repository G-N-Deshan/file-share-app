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

interface Props {
  code: string;
  onBack?: () => void;
}

export default function CodeFileList({ code, onBack }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/files-by-code/${code.trim().toUpperCase()}`);
      setFiles(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'No files found for this access code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [code]);

  const downloadAll = () => {
    files.forEach((f, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = `/download/${f.id}`;
        link.download = f.original_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 300);
    });
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={36} sx={{ color: '#2563eb' }} />
        <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
          Searching for files linked to code <strong>{code}</strong>...
        </Typography>
      </Box>
    );
  }

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
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            ACCESS CODE:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
            {code.toUpperCase()}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {files.length} file{files.length !== 1 ? 's' : ''} available
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {files.length > 1 && (
            <Button
              variant="contained"
              onClick={downloadAll}
              sx={{
                bgcolor: '#059669',
                '&:hover': { bgcolor: '#047857' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              ⬇ Download All ({files.length})
            </Button>
          )}

          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Enter Another Code
            </Button>
          )}
        </Box>
      </Paper>

      {error ? (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {error}
          {onBack && (
            <Button size="small" onClick={onBack} sx={{ ml: 2, textTransform: 'none', fontWeight: 600 }}>
              Try Another Code
            </Button>
          )}
        </Alert>
      ) : files.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No files currently active under this code. Files might have expired after 90 days.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {files.map((file) => (
            <Grid item xs={12} sm={6} key={file.id}>
              <FileCard file={file} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
