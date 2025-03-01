import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingIndicator = ({ message = "Loading..." }) => (
  <Box 
    display="flex" 
    flexDirection="column"
    alignItems="center" 
    justifyContent="center" 
    sx={{ p: 4 }}
  >
    <CircularProgress size={40} />
    <Typography variant="body1" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

export default LoadingIndicator;