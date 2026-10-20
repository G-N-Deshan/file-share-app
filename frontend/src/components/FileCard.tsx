import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { formatBytes, formatDate, getFileTypeBadge } from '../utils/formatters';

export interface FileItem {
  id: string;
  original_name: string;
  size: number;
  mime: string;
  uploaded_at: string;
  access_code?: string;
  path?: string;
}

interface Props {
  file: FileItem;
  showCodeBadge?: boolean;
}

export default function FileCard({ file, showCodeBadge = false }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const badge = getFileTypeBadge(file.original_name, file.mime || '');
  const downloadUrl = `/download/${file.id}`;
  const previewUrl = `/files/${file.id}`;

  const isImage = badge.type === 'image';
  const isPdf = badge.type === 'pdf';

  const copyDirectLink = () => {
    const fullUrl = `${window.location.origin}${downloadUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          bgcolor: '#ffffff'
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Chip
              label={badge.label}
              size="small"
              sx={{
                bgcolor: badge.color,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 1.5
              }}
            />
            {showCodeBadge && file.access_code && (
              <Chip
                label={`Code: ${file.access_code}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: '#cbd5e1' }}
              />
            )}
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              color: '#1e293b',
              wordBreak: 'break-word',
              mb: 0.5,
              lineHeight: 1.3
            }}
          >
            {file.original_name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, color: '#64748b', fontSize: '0.82rem' }}>
            <span>{formatBytes(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.uploaded_at)}</span>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            href={downloadUrl}
            target="_blank"
            download={file.original_name}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' }
            }}
          >
            ⬇ Download
          </Button>

          {(isImage || isPdf) && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPreviewOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              👁 Preview
            </Button>
          )}

          <Button
            size="small"
            color="inherit"
            onClick={copyDirectLink}
            sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#64748b' }}
          >
            {copied ? '✓ Copied' : '🔗 Link'}
          </Button>
        </CardActions>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>
            {file.original_name}
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: 'center', p: 2, minHeight: 300, bgcolor: '#f1f5f9' }}>
          {isImage ? (
            <img
              src={previewUrl}
              alt={file.original_name}
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
            />
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              title={file.original_name}
              style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8 }}
            />
          ) : (
            <Typography>Preview not available for this file type.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
