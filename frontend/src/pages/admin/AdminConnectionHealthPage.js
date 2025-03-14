import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const mockConnections = [
  {
    id: 1,
    provider: 'AWS',
    accountId: '123456789012',
    region: 'us-east-1',
    status: 'healthy',
    lastSync: '2024-03-20T10:30:00Z',
    services: ['EC2', 'S3', 'RDS'],
    issues: [],
  },
  {
    id: 2,
    provider: 'Azure',
    accountId: 'subscription-123',
    region: 'eastus',
    status: 'warning',
    lastSync: '2024-03-20T10:25:00Z',
    services: ['VM', 'Storage', 'SQL'],
    issues: ['High latency in some regions'],
  },
  {
    id: 3,
    provider: 'GCP',
    accountId: 'project-456',
    region: 'us-central1',
    status: 'error',
    lastSync: '2024-03-20T09:45:00Z',
    services: ['Compute', 'Storage'],
    issues: ['Authentication failed', 'API rate limit exceeded'],
  },
];

const AdminConnectionHealthPage = () => {
  const [connections, setConnections] = useState(mockConnections);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRefresh = () => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: 'Connection status refreshed',
      severity: 'success'
    });
  };

  const handleReconnect = (connectionId) => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: 'Reconnection initiated',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const stats = {
    total: connections.length,
    healthy: connections.filter(c => c.status === 'healthy').length,
    warning: connections.filter(c => c.status === 'warning').length,
    error: connections.filter(c => c.status === 'error').length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Connection Health</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh Status
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Connections
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Healthy
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.healthy}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Warning
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.warning}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Error
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.error}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Account ID</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Sync</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Issues</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {connections.map((connection) => (
              <TableRow key={connection.id}>
                <TableCell>{connection.provider}</TableCell>
                <TableCell>{connection.accountId}</TableCell>
                <TableCell>{connection.region}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(connection.status)}
                    <Chip
                      label={connection.status}
                      color={getStatusColor(connection.status)}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>{formatDate(connection.lastSync)}</TableCell>
                <TableCell>
                  {connection.services.map((service, index) => (
                    <Chip
                      key={index}
                      label={service}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {connection.issues.map((issue, index) => (
                    <Typography key={index} variant="body2" color="error">
                      {issue}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  {connection.status !== 'healthy' && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleReconnect(connection.id)}
                    >
                      Reconnect
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminConnectionHealthPage; 