import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { getMockHistoricalCostData, getMockOptimizationRecommendations } from '../services/mockData';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    total_costs: { current: 0, previous: 0, change: 0 },
    cost_savings: { current: 0, previous: 0, change: 0 },
    active_resources: { current: 0, previous: 0, change: 0 },
    optimization_score: { current: 0, previous: 0, change: 0 }
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      // Get historical cost data
      const historicalData = await getMockHistoricalCostData(30);
      const currentCosts = historicalData.slice(-1)[0].cost;
      const previousCosts = historicalData.slice(-2)[0].cost;
      const costChange = currentCosts - previousCosts;

      // Get optimization recommendations
      const recommendations = await getMockOptimizationRecommendations();
      const totalSavings = recommendations.current_recommendations.reduce((sum, rec) => sum + rec.savings, 0);

      // Calculate active resources (simplified)
      const activeResources = historicalData.length;

      // Calculate optimization score (simplified)
      const optimizationScore = Math.min(100, (totalSavings / currentCosts) * 100);

      setDashboardData({
        total_costs: { current: currentCosts, previous: previousCosts, change: costChange },
        cost_savings: { current: totalSavings, previous: totalSavings * 0.9, change: totalSavings * 0.1 },
        active_resources: { current: activeResources, previous: activeResources - 1, change: 1 },
        optimization_score: { current: optimizationScore, previous: optimizationScore - 5, change: 5 }
      });
    };

    loadDashboardData();
  }, []);

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
            dashboardData.total_costs.current,
            dashboardData.total_costs.previous,
            dashboardData.total_costs.change
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Cost Savings',
            dashboardData.cost_savings.current,
            dashboardData.cost_savings.previous,
            dashboardData.cost_savings.change
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Active Resources',
            dashboardData.active_resources.current,
            dashboardData.active_resources.previous,
            dashboardData.active_resources.change,
            (value) => value.toFixed(0)
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderMetricCard(
            'Optimization Score',
            dashboardData.optimization_score.current,
            dashboardData.optimization_score.previous,
            dashboardData.optimization_score.change,
            formatPercentage
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 