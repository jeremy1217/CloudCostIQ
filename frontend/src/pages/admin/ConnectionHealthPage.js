import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import CloudConnectionHealth from '../../components/CloudConnectionHealth';
import { Link as RouterLink } from 'react-router-dom';

const ConnectionHealthPage = () => {
  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/admin" color="inherit">
            Admin
          </Link>
          <Typography color="text.primary">Connection Health</Typography>
        </Breadcrumbs>
      </Box>

      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Cloud Connection Health
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor the health and performance of your cloud provider connections
        </Typography>
      </Box>

      <CloudConnectionHealth />
    </Container>
  );
};

export default ConnectionHealthPage; 