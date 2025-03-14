import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';
import { mockAdminDashboardData } from '../../services/mockData';

const AdminDashboardPage = () => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMetricCard = (title, value, icon, color = 'primary.main') => {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
      </Paper>
    );
  };

  const renderSystemHealthCard = () => {
    const { cpu, memory, disk, active_connections } = mockAdminDashboardData.system_health;
    
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Health
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              CPU Usage
            </Typography>
            <Typography variant="h6" color={cpu > 80 ? 'error.main' : 'success.main'}>
              {cpu}%
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Memory Usage
            </Typography>
            <Typography variant="h6" color={memory > 80 ? 'error.main' : 'success.main'}>
              {memory}%
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Disk Usage
            </Typography>
            <Typography variant="h6" color={disk > 80 ? 'error.main' : 'success.main'}>
              {disk}%
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Active Connections
            </Typography>
            <Typography variant="h6" color={active_connections > 100 ? 'error.main' : 'success.main'}>
              {active_connections}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Total Users',
            mockAdminDashboardData.total_users,
            <CheckCircle color="primary" />
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Active Connections',
            mockAdminDashboardData.active_connections,
            <CheckCircle color="success" />
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'System Health',
            mockAdminDashboardData.system_health.status,
            mockAdminDashboardData.system_health.status === 'Healthy' ? 
              <CheckCircle color="success" /> : 
              <Warning color="warning" />
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Last Backup',
            formatDate(mockAdminDashboardData.last_backup),
            <CheckCircle color="info" />
          )}
        </Grid>
        <Grid item xs={12}>
          {renderSystemHealthCard()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage; 