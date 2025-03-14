import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UserManagementPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          User management features will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserManagementPage; 