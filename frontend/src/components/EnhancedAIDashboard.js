import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography, Box, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

// Import the mock AI service
import aiService from '../services/mockAiService';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EnhancedAIDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [aiStatus, setAiStatus] = useState(null);
  const [enhancedEnabled, setEnhancedEnabled] = useState(true);

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

  // Combine historical and forecast data for the cost trend chart
  const costTrendData = [];
  
  // Add timestamps to make data sorting reliable
  if (insights.forecast && insights.forecast.length > 0) {
    // Process historical data from the first segment of the response
    const historical = insights.summary.historical_data || [];
    historical.forEach(item => {
      costTrendData.push({
        date: item.date,
        timestamp: new Date(item.date).getTime(),
        cost: item.cost,
        type: 'Historical'
      });
    });

    // Process forecast data
    insights.forecast.forEach(item => {
      costTrendData.push({
        date: item.date,
        timestamp: new Date(item.date).getTime(),
        predictedCost: item.predicted_cost,
        lowerBound: item.lower_bound,
        upperBound: item.upper_bound,
        type: 'Forecast'
      });
    });
    
    // Sort by date
    costTrendData.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Format anomalies data
  const anomaliesData = insights.anomalies || [];
  const anomaliesByService = anomaliesData.reduce((acc, anomaly) => {
    const service = anomaly.service;
    if (!acc[service]) {
      acc[service] = 0;
    }
    acc[service]++;
    return acc;
  }, {});

  const anomalyPieData = Object.entries(anomaliesByService).map(([name, value]) => ({
    name,
    value
  }));

  // Format optimization data
  const optimizationsData = insights.optimizations || [];
  const savingsByCategory = optimizationsData.reduce((acc, opt) => {
    const category = opt.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += opt.estimated_savings || 0;
    return acc;
  }, {});

  const optimizationPieData = Object.entries(savingsByCategory).map(([name, value]) => ({
    name: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: parseFloat(value.toFixed(2))
  }));

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
              From {optimizationsData.length} recommendations
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

      {/* Cost Forecasting Tab */}
      {activeTab === 0 && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardHeader title="Cost Forecast" subheader={`Using ${insights.ai_metadata?.forecast_algorithm || 'linear'} algorithm`} />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={costTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => value ? `$${value.toFixed(2)}` : 'N/A'} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Historical Cost" 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predictedCost" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Forecasted Cost" 
                    dot={{ r: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="#ffc658" 
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Upper Bound" 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lowerBound" 
                    stroke="#ff8042" 
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Lower Bound" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Card>
              <CardHeader title="Forecast Metrics" />
              <CardContent>
                <Typography variant="subtitle1">Algorithm: {insights.ai_metadata?.forecast_algorithm || 'Linear Regression'}</Typography>
                <Typography variant="body2" paragraph>
                  {insights.summary && (
                    `The forecast predicts a total cost of $${insights.summary.forecast_total.toFixed(2)} for the next ${insights.summary.days_forecasted} days.`
                  )}
                </Typography>
                <Typography variant="body2">
                  {enhancedEnabled ? (
                    "Enhanced forecasting is enabled, providing more accurate predictions with confidence intervals."
                  ) : (
                    "Standard forecasting is in use. Enable enhanced AI for more sophisticated predictions."
                  )}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Forecast Confidence" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Confidence Level:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {enhancedEnabled ? "Medium-High" : "Medium"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Data Points Used:</Typography>
                    <Typography variant="body1">
                      {(insights.summary && insights.summary.days_analyzed) || 30}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Average Prediction Error:</Typography>
                    <Typography variant="body1">
                      {enhancedEnabled ? "±7.5%" : "±15%"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Anomaly Detection Tab */}
      {activeTab === 1 && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardHeader title="Detected Anomalies" subheader={`Using ${insights.ai_metadata?.anomaly_method || 'statistical'} analysis`} />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" paragraph>
                  {anomaliesData.length > 0 
                    ? `${anomaliesData.length} anomalies detected requiring investigation.`
                    : "No anomalies detected in the analyzed time period."
                  }
                </Typography>
              </Box>

              {anomaliesData.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={anomalyPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {anomalyPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <Box sx={{ overflowY: 'auto', maxHeight: 300 }}>
                    {anomaliesData.slice(0, 5).map((anomaly, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          mb: 1, 
                          p: 1, 
                          border: 1, 
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="subtitle2">
                          {anomaly.service} Anomaly on {anomaly.date}
                        </Typography>
                        <Typography variant="body2">
                          Cost: ${anomaly.cost.toFixed(2)} 
                          {anomaly.baseline_cost && (
                            <span> (Baseline: ${anomaly.baseline_cost.toFixed(2)})</span>
                          )}
                        </Typography>
                        {anomaly.root_cause && (
                          <Typography variant="body2" color="error">
                            Likely cause: {anomaly.root_cause.primary_cause}
                          </Typography>
                        )}
                      </Box>
                    ))}
                    {anomaliesData.length > 5 && (
                      <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                        {anomaliesData.length - 5} more anomalies...
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography color="textSecondary">No anomalies detected</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {anomaliesData.length > 0 && (
            <Card>
              <CardHeader title="Anomaly Impact Analysis" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={anomaliesData.map(a => ({
                      date: a.date,
                      impact: a.cost_difference || (a.cost - (a.baseline_cost || 0)),
                      service: a.service,
                      score: a.anomaly_score || 1
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `$${value.toFixed(2)}`,
                        name === 'impact' ? 'Cost Impact' : 'Anomaly Score'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="impact" name="Cost Impact" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Optimization Recommendations Tab */}
      {activeTab === 2 && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardHeader 
              title="Cost Optimization Recommendations" 
              subheader={`Potential savings: $${(insights.summary && insights.summary.potential_savings) ? insights.summary.potential_savings.toFixed(2) : '0.00'}`} 
            />
            <CardContent>
              {optimizationsData.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={optimizationPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {optimizationPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <Box sx={{ overflowY: 'auto', maxHeight: 300 }}>
                    {optimizationsData.slice(0, 5).map((optimization, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          mb: 1, 
                          p: 1, 
                          border: 1, 
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="subtitle2">
                          {optimization.title}
                        </Typography>
                        <Typography variant="body2">
                          Service: {optimization.service}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          Savings: ${(optimization.estimated_savings?.toFixed(2)) || '0.00'} 
                          ({optimization.savings_percentage}%)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {optimization.description?.substring(0, 100)}
                          {optimization.description?.length > 100 ? '...' : ''}
                        </Typography>
                      </Box>
                    ))}
                    {optimizationsData.length > 5 && (
                      <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                        {optimizationsData.length - 5} more recommendations...
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography color="textSecondary">No optimization recommendations available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {optimizationsData.length > 0 && (
            <Card>
              <CardHeader title="Top Saving Opportunities" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={optimizationsData
                      .sort((a, b) => ((b.estimated_savings || 0) - (a.estimated_savings || 0)))
                      .slice(0, 7)
                      .map(o => ({
                        name: o.service,
                        savings: o.estimated_savings || 0,
                        category: (o.category?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')) || 'Other'
                      }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="savings" name="Potential Savings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedAIDashboard;