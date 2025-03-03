import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnomalyDetectionTab = ({ anomaliesData, anomalyPieData, insights }) => {
  return (
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
  );
};

export default AnomalyDetectionTab;