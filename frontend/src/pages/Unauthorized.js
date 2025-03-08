import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Unauthorized = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography variant="body1" paragraph>
            You don't have permission to access this page.
          </Typography>
          
          <Typography variant="body2" paragraph color="text.secondary">
            If you believe this is an error, please contact your administrator.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/"
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;