// frontend/src/components/EnhancedAIDashboard.js
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import LoadingIndicator from './LoadingIndicator';
import aiService from '../services/mockAiService';

// Lazy load chart components 
const CostForecastTab = lazy(() => import('./ai-dashboard/CostForecastTab'));
const AnomalyDetectionTab = lazy(() => import('./ai-dashboard/AnomalyDetectionTab'));
const OptimizationTab = lazy(() => import('./ai-dashboard/OptimizationTab'));

const EnhancedAIDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [aiStatus, setAiStatus] = useState(null);
  const [enhancedEnabled, setEnhancedEnabled] = useState(true);
  // Add these state variables to store processed data
  const [costTrendData, setCostTrendData] = useState([]);
  const [anomalyPieData, setAnomalyPieData] = useState([]);
  const [optimizationPieData, setOptimizationPieData] = useState([]);

  // Fetch combined AI insights
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        // For testing, we'll use dummy data until the backend is fully set up
        const data = await aiService.getCombinedInsights({
          days: 30,
          forecast_days: 14
        });
        setInsights(data);
        
        // Process data for charts
        processCostTrendData(data);
        processAnomalyData(data);
        processOptimizationData(data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        setError('Failed to load AI insights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchAIStatus = async () => {
      try {
        const status = await aiService.getAIStatus();
        setAiStatus(status);
        setEnhancedEnabled(status.enhanced_ai_enabled);
      } catch (err) {
        console.error('Error fetching AI status:', err);
      }
    };

    fetchInsights();
    fetchAIStatus();
  }, []);

  // Process cost trend data
  const processCostTrendData = (data) => {
    if (!data || !data.forecast || data.forecast.length === 0) return;
    
    const trendData = [];
    
    // Process historical data
    const historical = data.summary?.historical_data || [];
    historical.forEach(item => {
      trendData.push({
        date: item.date,
        timestamp: new Date(item.date).getTime(),
        cost: item.cost,
        type: 'Historical'
      });
    });

    // Process forecast data
    data.forecast.forEach(item => {
      trendData.push({
        date: item.date,
        timestamp: new Date(item.date).getTime(),
        predictedCost: item.predicted_cost,
        lowerBound: item.lower_bound,
        upperBound: item.upper_bound,
        type: 'Forecast'
      });
    });
    
    // Sort by date
    trendData.sort((a, b) => a.timestamp - b.timestamp);
    setCostTrendData(trendData);
  };

  // Process anomaly data
  const processAnomalyData = (data) => {
    if (!data || !data.anomalies) return;
    
    const anomaliesData = data.anomalies || [];
    const anomaliesByService = anomaliesData.reduce((acc, anomaly) => {
      const service = anomaly.service;
      if (!acc[service]) {
        acc[service] = 0;
      }
      acc[service]++;
      return acc;
    }, {});

    const pieData = Object.entries(anomaliesByService).map(([name, value]) => ({
      name,
      value
    }));
    
    setAnomalyPieData(pieData);
  };

  // Process optimization data
  const processOptimizationData = (data) => {
    if (!data || !data.optimizations) return;
    
    const optimizationsData = data.optimizations || [];
    const savingsByCategory = optimizationsData.reduce((acc, opt) => {
      const category = opt.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += opt.estimated_savings || 0;
      return acc;
    }, {});

    const pieData = Object.entries(savingsByCategory).map(([name, value]) => ({
      name: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: parseFloat(value.toFixed(2))
    }));
    
    setOptimizationPieData(pieData);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleEnhancedAI = async () => {
    try {
      const response = await aiService.configureAI(!enhancedEnabled);
      setAiStatus(response.status);
      setEnhancedEnabled(!enhancedEnabled);
      
      // Refresh insights with new AI settings
      const insightsData = await aiService.getCombinedInsights();
      setInsights(insightsData);
      
      // Reprocess data for charts
      processCostTrendData(insightsData);
      processAnomalyData(insightsData);
      processOptimizationData(insightsData);
    } catch (err) {
      console.error('Error toggling enhanced AI:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading AI insights...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Process data for charts if insights are available
  if (!insights) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No AI insights available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Enhanced AI Insights Dashboard</Typography>
        <Box>
          <Button 
            variant={enhancedEnabled ? "contained" : "outlined"} 
            color={enhancedEnabled ? "primary" : "secondary"}
            onClick={toggleEnhancedAI}
          >
            {enhancedEnabled ? "Enhanced AI: ON" : "Enhanced AI: OFF"}
          </Button>
        </Box>
      </Box>

      {/* AI Status Info */}
      {aiStatus && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">AI Status</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                <Typography variant="subtitle2">Enhanced AI</Typography>
                <Typography variant="body2" color={enhancedEnabled ? "primary" : "text.secondary"}>
                  {enhancedEnabled ? "Enabled" : "Disabled"}
                </Typography>
              </Box>
              {insights.ai_metadata && insights.ai_metadata.forecast_algorithm && (
                <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                  <Typography variant="subtitle2">Forecast Algorithm</Typography>
                  <Typography variant="body2">{insights.ai_metadata.forecast_algorithm}</Typography>
                </Box>
              )}
              {insights.ai_metadata && insights.ai_metadata.anomaly_method && (
                <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                  <Typography variant="subtitle2">Anomaly Detection</Typography>
                  <Typography variant="body2">{insights.ai_metadata.anomaly_method}</Typography>
                </Box>
              )}
              <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                <Typography variant="subtitle2">Optimization Categories</Typography>
                <Typography variant="body2">
                  {(insights.ai_metadata && insights.ai_metadata.optimization_categories) || 0} Categories
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Total Analyzed Cost</Typography>
            <Typography variant="h5" component="div">
              ${insights.summary && insights.summary.total_cost ? insights.summary.total_cost.toFixed(2) : 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Past {insights.summary && insights.summary.days_analyzed} days
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Forecasted Cost</Typography>
            <Typography variant="h5" component="div">
              ${insights.summary && insights.summary.forecast_total ? insights.summary.forecast_total.toFixed(2) : 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Next {insights.summary && insights.summary.days_forecasted} days
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Detected Anomalies</Typography>
            <Typography variant="h5" component="div">
              {(insights.summary && insights.summary.anomaly_count) || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Requiring investigation
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Potential Savings</Typography>
            <Typography variant="h5" component="div" color="success.main">
              ${insights.summary && insights.summary.potential_savings ? insights.summary.potential_savings.toFixed(2) : 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              From {insights.optimizations ? insights.optimizations.length : 0} recommendations
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Cost Forecasting" />
        <Tab label="Anomaly Detection" />
        <Tab label="Optimization Recommendations" />
      </Tabs>

      {/* Lazy load the tab content */}
      {activeTab === 0 && insights && (
        <Suspense fallback={<LoadingIndicator message="Loading forecast data..." />}>
          <CostForecastTab 
            costTrendData={costTrendData} 
            insights={insights} 
            enhancedEnabled={enhancedEnabled} 
          />
        </Suspense>
      )}

      {activeTab === 1 && insights && (
        <Suspense fallback={<LoadingIndicator message="Loading anomaly data..." />}>
          <AnomalyDetectionTab 
            anomaliesData={insights.anomalies || []} 
            anomalyPieData={anomalyPieData} 
            insights={insights}
          />
        </Suspense>
      )}

      {activeTab === 2 && insights && (
        <Suspense fallback={<LoadingIndicator message="Loading optimization data..." />}>
          <OptimizationTab 
            optimizationsData={insights.optimizations || []} 
            optimizationPieData={optimizationPieData} 
            insights={insights}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default EnhancedAIDashboard;