import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const LoadingIndicator = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...(fullScreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: 9999,
          }),
        }}
      >
        <CircularProgress
          size={40}
          thickness={4}
          sx={{
            color: 'primary.main',
            mb: 2,
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

export default LoadingIndicator;