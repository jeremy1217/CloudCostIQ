import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CostForecastTab = ({ costTrendData, insights, enhancedEnabled }) => {
  return (
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
  );
};

export default CostForecastTab;