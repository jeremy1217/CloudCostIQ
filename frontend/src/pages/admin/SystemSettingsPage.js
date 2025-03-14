import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SystemSettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          System configuration and settings will be managed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SystemSettingsPage; 