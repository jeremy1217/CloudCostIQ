import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OptimizationTab = ({ optimizationsData, optimizationPieData, insights }) => {
  return (
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
  );
};

export default OptimizationTab;