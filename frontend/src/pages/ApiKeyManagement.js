import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import ApiKeyManager from '../components/ApiKeyManager';

const ApiKeyManagement = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Cloud Provider API Keys
      </Typography>
      
      <Typography variant="body1" paragraph>
        Manage your cloud provider API keys to enable CloudCostIQ to securely access your cloud account information.
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <ApiKeyManager />
      </Paper>
    </Container>
  );
};

export default ApiKeyManagement;