import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Stack,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const CloudConnectionHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cloud-connections/health');
      const data = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch connection health data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return null;
    }
  };

  const formatLatency = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatUptime = (percentage) => {
    return `${percentage.toFixed(2)}%`;
  };

  const getHealthScore = (metrics) => {
    const weights = {
      uptime: 0.4,
      latency: 0.3,
      errorRate: 0.3
    };

    const uptimeScore = Math.min(metrics.uptime / 99.9 * 100, 100) * weights.uptime;
    const latencyScore = Math.max(0, (1 - metrics.avgLatency / 1000)) * 100 * weights.latency;
    const errorScore = Math.max(0, (1 - metrics.errorRate)) * 100 * weights.errorRate;

    return Math.round(uptimeScore + latencyScore + errorScore);
  };

  if (loading && !healthData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Connection Health Dashboard</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Last updated: {lastUpdated?.toLocaleString()}
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchHealthData}
            size="small"
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Overall Health Summary */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Overall Health
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h4">
                  {healthData?.summary.healthScore}%
                </Typography>
                <Chip
                  icon={getStatusIcon(healthData?.summary.status)}
                  label={healthData?.summary.status.toUpperCase()}
                  color={getStatusColor(healthData?.summary.status)}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={healthData?.summary.healthScore || 0}
                sx={{ mt: 2 }}
                color={getStatusColor(healthData?.summary.status)}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Active Connections
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h4">
                  {healthData?.summary.activeConnections}
                </Typography>
                <Typography
                  variant="body2"
                  color={healthData?.summary.connectionTrend > 0 ? 'success.main' : 'error.main'}
                  display="flex"
                  alignItems="center"
                >
                  {healthData?.summary.connectionTrend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {Math.abs(healthData?.summary.connectionTrend)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {healthData?.summary.totalConnections} total connections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                System Status
              </Typography>
              <Stack spacing={1}>
                {healthData?.summary.systemStatuses.map((status, index) => (
                  <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{status.name}</Typography>
                    <Chip
                      size="small"
                      label={status.status}
                      color={getStatusColor(status.status)}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Connection Status */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Health Score</TableCell>
              <TableCell>Uptime</TableCell>
              <TableCell>Avg. Latency</TableCell>
              <TableCell>Error Rate</TableCell>
              <TableCell>Last Checked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {healthData?.connections.map((connection) => (
              <TableRow key={connection.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <img
                      src={`/${connection.provider.toLowerCase()}-logo.png`}
                      alt={`${connection.provider} logo`}
                      style={{ width: 24, height: 24 }}
                    />
                    <Typography>{connection.provider}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    icon={getStatusIcon(connection.status)}
                    label={connection.status.toUpperCase()}
                    color={getStatusColor(connection.status)}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Based on uptime, latency, and error rate">
                    <Box>
                      <Typography variant="body2">
                        {getHealthScore(connection.metrics)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getHealthScore(connection.metrics)}
                        sx={{ mt: 0.5 }}
                        color={getStatusColor(connection.status)}
                      />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatUptime(connection.metrics.uptime)}</TableCell>
                <TableCell>{formatLatency(connection.metrics.avgLatency)}</TableCell>
                <TableCell>{(connection.metrics.errorRate * 100).toFixed(2)}%</TableCell>
                <TableCell>
                  <Tooltip title={new Date(connection.lastChecked).toLocaleString()}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(connection.lastChecked).toLocaleDateString()}
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CloudConnectionHealth; 