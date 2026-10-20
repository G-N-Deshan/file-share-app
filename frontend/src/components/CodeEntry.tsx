import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import CodeFileList from './CodeFileList';

interface Props {
  initialCode?: string;
}

export default function CodeEntry({ initialCode = '' }: Props) {
  const [code, setCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setSubmittedCode(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your secret access code.');
      return;
    }
    setError('');
    setSubmittedCode(clean);
  };

  if (submittedCode) {
    return <CodeFileList code={submittedCode} onBack={() => setSubmittedCode('')} />;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 6 },
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          textAlign: 'center'
        }}
      >
        <Box sx={{ fontSize: '3.5rem', mb: 1.5 }}>🔑</Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
          Receive Files on this Device
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5, fontSize: '0.95rem' }}>
          Type or paste the 6-character access code shown on the sending screen.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="e.g. 8A3F9C"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            inputProps={{
              maxLength: 12,
              style: {
                textAlign: 'center',
                letterSpacing: 6,
                fontWeight: 800,
                fontSize: '2rem',
                fontFamily: 'monospace',
                padding: '20px 14px'
              }
            }}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f8fafc',
                '&:hover fieldset': {
                  borderColor: '#2563eb'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                  borderWidth: 2
                }
              }
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, textAlign: 'left', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={!code.trim()}
            sx={{
              py: 1.8,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              borderRadius: 3,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}
          >
            Find & Download Files →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
