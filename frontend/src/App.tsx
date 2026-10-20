import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import UploadDropzone from './components/UploadDropzone';
import CodeEntry from './components/CodeEntry';
import RecentFiles from './components/RecentFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [initialCode, setInitialCode] = useState('');

  // Check URL query parameters (e.g. ?code=8A3F9C) for automatic code filling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setInitialCode(codeParam.toUpperCase());
      setActiveTab(1); // Switch to Receive tab
    }
  }, []);

  const handleSwitchToReceive = (code: string) => {
    setInitialCode(code);
    setActiveTab(1);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* Top Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                bgcolor: '#2563eb',
                color: '#fff',
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}
            >
              ⚡
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#1e293b' }}>
                FileDrop
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Fast Cross-Device File Sharing
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
              100MB limit • 90-day retention
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, flex: 1 }}>
        {/* Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            p: 0.5
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                py: 1.5,
                borderRadius: 2
              }
            }}
          >
            <Tab label="📤 Send / Upload Files" />
            <Tab label="📥 Receive with Code" />
            <Tab label="📂 Recent Uploads" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        {activeTab === 0 && <UploadDropzone onSwitchToReceive={handleSwitchToReceive} />}
        {activeTab === 1 && <CodeEntry initialCode={initialCode} />}
        {activeTab === 2 && <RecentFiles />}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          color: '#94a3b8',
          fontSize: '0.85rem'
        }}
      >
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          FileDrop • Designed for Students & Multi-Device Productivity
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          Free Hosting on Render • Files automatically deleted after 90 days
        </Typography>
      </Box>
    </Box>
  );
}
