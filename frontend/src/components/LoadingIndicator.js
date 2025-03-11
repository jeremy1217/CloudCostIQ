import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const LoadingIndicator = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Fade in={true} style={{ transitionDelay: '300ms' }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.5,
              },
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