// frontend/src/components/EnhancedAIDashboard.js
import React, { useState, lazy, Suspense } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import LoadingIndicator from './LoadingIndicator';
import { useCombinedInsights, useAIStatus, useToggleEnhancedAI } from '../hooks/useApi';

// Lazy load tab components 
const CostForecastTab = lazy(() => import('./ai-dashboard/CostForecastTab'));
const AnomalyDetectionTab = lazy(() => import('./ai-dashboard/AnomalyDetectionTab'));
const OptimizationTab = lazy(() => import('./ai-dashboard/OptimizationTab'));

const EnhancedAIDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [costTrendData, setCostTrendData] = useState([]);
  const [anomalyPieData, setAnomalyPieData] = useState([]);
  const [optimizationPieData, setOptimizationPieData] = useState([]);

  // Use React Query hooks
  const { 
    data: insights, 
    isLoading: insightsLoading, 
    isError: insightsError, 
    error: insightsErrorMessage 
  } = useCombinedInsights({ days: 30, forecast_days: 14 });
  
  const { 
    data: aiStatus, 
    isLoading: statusLoading 
  } = useAIStatus();
  
  const toggleEnhancedAI = useToggleEnhancedAI();
  
  // Enhanced AI status
  const enhancedEnabled = aiStatus?.enhanced_ai_enabled || false;

  // Process data when insights change
  React.useEffect(() => {
    if (insights) {
      processCostTrendData(insights);
      processAnomalyData(insights);
      processOptimizationData(insights);
    }
  }, [insights]);

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

  const handleToggleEnhancedAI = () => {
    toggleEnhancedAI.mutate(!enhancedEnabled);
  };

  if (insightsLoading || statusLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading AI insights...</Typography>
      </Box>
    );
  }

  if (insightsError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{insightsErrorMessage?.message || 'Failed to load AI insights. Please try again.'}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

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
            onClick={handleToggleEnhancedAI}
            disabled={toggleEnhancedAI.isPending}
          >
            {toggleEnhancedAI.isPending ? "Updating..." : enhancedEnabled ? "Enhanced AI: ON" : "Enhanced AI: OFF"}
          </Button>
        </Box>
      </Box>

      {/* Rest of component with AI Status and tabs remain the same */}
      {/* ... */}
    </Box>
  );
};

export default EnhancedAIDashboard;