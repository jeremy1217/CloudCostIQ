import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  description, 
  breadcrumbs = [],
  action,
  sx = {} 
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 3,
        background: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'divider',
        ...sx
      }}
    >
      {breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={crumb.text} color="text.primary">
                {crumb.text}
              </Typography>
            ) : (
              <Link
                key={crumb.text}
                component={RouterLink}
                to={crumb.href}
                color="inherit"
                sx={{
                  '&:hover': {
                    textDecoration: 'none',
                    color: 'primary.main',
                  },
                }}
              >
                {crumb.text}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: description ? 1 : 0,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: '800px' }}
            >
              {description}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ ml: 2 }}>
            {action}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PageHeader; 