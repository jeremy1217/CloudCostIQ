import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { mockDashboardData } from '../services/mockData';

const DashboardPage = () => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderMetricCard = (title, current, previous, change, format = formatCurrency) => {
    const isPositive = change >= 0;
    const formattedChange = format(Math.abs(change));

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" gutterBottom>
          {format(current)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main' }}>
          {isPositive ? <TrendingUp /> : <TrendingDown />}
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {formattedChange} from last period
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Total Cloud Costs',
            mockDashboardData.total_costs.current,
            mockDashboardData.total_costs.previous,
            mockDashboardData.total_costs.change
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Cost Savings',
            mockDashboardData.cost_savings.current,
            mockDashboardData.cost_savings.previous,
            mockDashboardData.cost_savings.change
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Active Resources',
            mockDashboardData.active_resources.current,
            mockDashboardData.active_resources.previous,
            mockDashboardData.active_resources.change,
            (value) => value.toFixed(0)
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Optimization Score',
            mockDashboardData.optimization_score.current,
            mockDashboardData.optimization_score.previous,
            mockDashboardData.optimization_score.change,
            formatPercentage
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 