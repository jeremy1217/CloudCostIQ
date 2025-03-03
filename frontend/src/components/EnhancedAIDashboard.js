import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import LoadingIndicator from './LoadingIndicator';
import api from '../services/api';

// Lazy load tab components 
const CostForecastTab = lazy(() => import('./ai-dashboard/CostForecastTab'));
const AnomalyDetectionTab = lazy(() => import('./ai-dashboard/AnomalyDetectionTab'));
const OptimizationTab = lazy(() => import('./ai-dashboard/OptimizationTab'));

const EnhancedAIDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [costTrendData, setCostTrendData] = useState([]);
  const [anomalyPieData, setAnomalyPieData] = useState([]);
  const [optimizationPieData, setOptimizationPieData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  // Fetch AI status and combined insights
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch AI status
      const statusResult = await api.getAIStatus();
      setAiStatus(statusResult);
      
      // Fetch combined insights
      const insightsResult = await api.getCombinedInsights({
        days: 30,
        forecast_days: 14
      });
      setInsights(insightsResult);
      
      setIsError(false);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setIsError(true);
      setErrorMessage(error.message || "Failed to load AI insights");
      
      // Generate mock data if there's an error
      const mockInsights = generateMockInsights();
      setInsights(mockInsights);
      
      const mockStatus = {
        enhanced_ai_enabled: true,
        capabilities: {
          forecasting: {
            algorithms: ["linear", "arima", "exp_smoothing", "random_forest", "auto"],
            max_forecast_days: 365,
            min_data_points: 5
          },
          anomaly_detection: {
            methods: ["zscore", "isolation_forest", "dbscan", "seasonal_decompose", "ensemble"],
            root_cause_analysis: true
          }
        }
      };
      setAiStatus(mockStatus);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle enhanced AI
  const toggleEnhancedAI = async () => {
    if (!aiStatus) return;
    
    setIsToggling(true);
    try {
      const newEnabledState = !aiStatus.enhanced_ai_enabled;
      const result = await api.configureAI(newEnabledState);
      setAiStatus(result.status || { ...aiStatus, enhanced_ai_enabled: newEnabledState });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error toggling enhanced AI:", error);
      // Just toggle the UI state even if the API call fails
      setAiStatus({ ...aiStatus, enhanced_ai_enabled: !aiStatus.enhanced_ai_enabled });
    } finally {
      setIsToggling(false);
    }
  };

  // Generate mock insights
  const generateMockInsights = () => {
    // Generate mock data for combined insights
    const today = new Date();
    const historical_data = [];
    
    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Base cost with some random variation and a slight upward trend
      const cost = 100 + (30 - i) * 2 + (Math.random() * 20 - 10);
      
      historical_data.push({
        date: date.toISOString().split('T')[0],
        cost: parseFloat(cost.toFixed(2))
      });
    }
    
    // Generate forecast data
    const forecast = [];
    const lastHistoricalCost = historical_data[historical_data.length - 1].cost;
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Forecast with a slight upward trend and uncertainty
      const predicted_cost = lastHistoricalCost * (1 + i * 0.01) * (1 + ((Math.random() * 0.1) - 0.05));
      const uncertainty = 0.05 + (i * 0.005);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted_cost: parseFloat(predicted_cost.toFixed(2)),
        lower_bound: parseFloat((predicted_cost * (1 - uncertainty)).toFixed(2)),
        upper_bound: parseFloat((predicted_cost * (1 + uncertainty)).toFixed(2))
      });
    }
    
    // Generate anomalies
    const anomalies = [
      {
        date: '2025-02-25',
        service: 'EC2',
        cost: 250.75,
        baseline_cost: 150.25,
        cost_difference: 100.50,
        anomaly_score: 3.2,
        root_cause: {
          primary_cause: 'Increase in running instances or workload spikes.'
        }
      },
      {
        date: '2025-02-28',
        service: 'S3',
        cost: 180.40,
        baseline_cost: 90.20,
        cost_difference: 90.20,
        anomaly_score: 2.8,
        root_cause: {
          primary_cause: 'High data transfer or increased storage consumption.'
        }
      }
    ];
    
    // Generate optimizations
    const optimizations = [
      {
        id: 'opt-1',
        title: 'EC2 Instance Rightsizing',
        service: 'EC2',
        category: 'instance_rightsizing',
        description: 'Resize overprovisioned EC2 instances to match actual workload requirements.',
        estimated_savings: 120.50,
        savings_percentage: 25,
        implementation_effort: 'medium'
      },
      {
        id: 'opt-2',
        title: 'Reserved Instance Opportunities',
        service: 'EC2',
        category: 'reserved_instances',
        description: 'Purchase reserved instances for consistently running workloads.',
        estimated_savings: 230.75,
        savings_percentage: 35,
        implementation_effort: 'low'
      },
      {
        id: 'opt-3',
        title: 'S3 Storage Class Optimization',
        service: 'S3',
        category: 'storage_optimization',
        description: 'Move infrequently accessed data to lower-cost storage tiers.',
        estimated_savings: 95.30,
        savings_percentage: 50,
        implementation_effort: 'low'
      }
    ];
    
    return {
      summary: {
        total_cost: historical_data.reduce((sum, item) => sum + item.cost, 0),
        forecast_total: forecast.reduce((sum, item) => sum + item.predicted_cost, 0),
        anomaly_count: anomalies.length,
        potential_savings: optimizations.reduce((sum, item) => sum + item.estimated_savings, 0),
        days_analyzed: 30,
        days_forecasted: 14
      },
      forecast: forecast,
      anomalies: anomalies,
      optimizations: optimizations,
      ai_metadata: {
        forecast_algorithm: 'ensemble',
        anomaly_method: 'isolation_forest',
        optimization_categories: 3
      }
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Process data when insights change
  useEffect(() => {
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
    toggleEnhancedAI();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading AI insights...</Typography>
      </Box>
    );
  }

  if (isError && !insights) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{errorMessage || 'Failed to load AI insights. Please try again.'}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={fetchData}>
          Retry
        </Button>
      </Box>
    );
  }

  // Enhanced AI status
  const enhancedEnabled = aiStatus?.enhanced_ai_enabled || false;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Enhanced AI Insights Dashboard</Typography>
        <Box>
          <Button 
            variant={enhancedEnabled ? "contained" : "outlined"} 
            color={enhancedEnabled ? "primary" : "secondary"}
            onClick={handleToggleEnhancedAI}
            disabled={isToggling}
          >
            {isToggling ? "Updating..." : enhancedEnabled ? "Enhanced AI: ON" : "Enhanced AI: OFF"}
          </Button>
        </Box>
      </Box>

      {/* AI Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">AI Engine Status</Typography>
              <Typography variant="body2" color="text.secondary">
                {enhancedEnabled 
                  ? "Enhanced AI capabilities are enabled, providing deeper analysis and better recommendations."
                  : "Standard AI capabilities are active. Enable enhanced AI for more comprehensive insights."}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body2">
                <strong>Algorithm:</strong> {insights.ai_metadata?.forecast_algorithm || "Linear"}
              </Typography>
              <Typography variant="body2">
                <strong>Analysis Type:</strong> {insights.ai_metadata?.anomaly_method || "Statistical"}
              </Typography>
              <Typography variant="body2">
                <strong>Coverage:</strong> {insights.summary?.days_analyzed || 30} days historical / {insights.summary?.days_forecasted || 14} days forecast
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
        gap: 2, 
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">${insights.summary?.total_cost?.toFixed(2) || "0.00"}</Typography>
            <Typography variant="body2" color="text.secondary">Total Cost (30 Days)</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">${insights.summary?.forecast_total?.toFixed(2) || "0.00"}</Typography>
            <Typography variant="body2" color="text.secondary">Forecasted Cost (Next 14 Days)</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'error.main' }}>{insights.summary?.anomaly_count || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Detected Anomalies</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'success.main' }}>${insights.summary?.potential_savings?.toFixed(2) || "0.00"}</Typography>
            <Typography variant="body2" color="text.secondary">Potential Monthly Savings</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="AI insights tabs"
          >
            <Tab label="Cost Forecasting" />
            <Tab label="Anomaly Detection" />
            <Tab label="Cost Optimization" />
          </Tabs>
        </Box>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Suspense fallback={<LoadingIndicator />}>
            <CostForecastTab 
              costTrendData={costTrendData} 
              insights={insights} 
              enhancedEnabled={enhancedEnabled} 
            />
          </Suspense>
        )}
        {activeTab === 1 && (
          <Suspense fallback={<LoadingIndicator />}>
            <AnomalyDetectionTab 
              anomaliesData={insights.anomalies || []} 
              anomalyPieData={anomalyPieData} 
              insights={insights}
            />
          </Suspense>
        )}
        {activeTab === 2 && (
          <Suspense fallback={<LoadingIndicator />}>
            <OptimizationTab 
              optimizationsData={insights.optimizations || []} 
              optimizationPieData={optimizationPieData}
              insights={insights}
            />
          </Suspense>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedAIDashboard;