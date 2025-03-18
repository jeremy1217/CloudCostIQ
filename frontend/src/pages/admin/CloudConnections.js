import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import CloudProviderConnections from '../../components/CloudProviderConnections';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const CloudConnectionsPage = () => {
  const { user } = useAuth();

  // Redirect if user is not an admin
  if (!user || !user.roles?.includes('admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Cloud Provider Connections
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Connect your cloud provider accounts to enable cost tracking and optimization.
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <CloudProviderConnections />
      </Paper>
    </Container>
  );
};

export default CloudConnectionsPage; 