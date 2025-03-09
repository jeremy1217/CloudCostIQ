import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getMockOptimizationRecommendations } from '../../services/mockData';

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OptimizationTab = ({ optimizationsData, optimizationPieData, insights }) => {
  // Use provided optimization data or fallback to mock data
  const effectiveOptimizations = optimizationsData && optimizationsData.length > 0 
    ? optimizationsData 
    : getMockOptimizationRecommendations().current_recommendations;
  
  // Generate pie chart data if not provided
  const effectivePieData = optimizationPieData && optimizationPieData.length > 0 
    ? optimizationPieData 
    : generatePieData(effectiveOptimizations);
  
  // Function to generate pie data from optimizations
  function generatePieData(optimizations) {
    // Group optimizations by category
    const categoryGroups = optimizations.reduce((groups, opt) => {
      const category = opt.category || categorizeByService(opt.service) || 'Other';
      if (!groups[category]) {
        groups[category] = 0;
      }
      groups[category] += opt.estimated_savings || opt.savings || 0;
      return groups;
    }, {});
    
    // Convert to array format for pie chart
    return Object.entries(categoryGroups).map(([name, value]) => ({
      name: formatCategoryName(name),
      value: parseFloat(value.toFixed(2))
    }));
  }
  
  // Helper function to categorize by service if category is not available
  function categorizeByService(service) {
    if (!service) return 'Other';
    
    const serviceMap = {
      'EC2': 'compute_optimization',
      'S3': 'storage_optimization',
      'RDS': 'database_optimization',
      'Lambda': 'serverless_optimization',
      'VM': 'compute_optimization',
      'Storage': 'storage_optimization',
      'Compute Engine': 'compute_optimization'
    };
    
    return serviceMap[service] || 'other_optimization';
  }
  
  // Helper function to format category names
  function formatCategoryName(name) {
    return name.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Calculate total potential savings
  const totalSavings = effectiveOptimizations.reduce((sum, opt) => {
    return sum + (opt.estimated_savings || opt.savings || 0);
  }, 0);
  
  // Use insights if provided or create a fallback
  const effectiveInsights = insights || {
    summary: {
      potential_savings: totalSavings
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title="Cost Optimization Recommendations" 
          subheader={`Potential savings: $${(effectiveInsights.summary && effectiveInsights.summary.potential_savings) 
            ? effectiveInsights.summary.potential_savings.toFixed(2) 
            : totalSavings.toFixed(2)}`} 
        />
        <CardContent>
          {effectiveOptimizations.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={effectivePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {effectivePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <Box sx={{ overflowY: 'auto', maxHeight: 300 }}>
                {effectiveOptimizations.slice(0, 5).map((optimization, index) => (
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
                      {optimization.title || (optimization.service + " Optimization")}
                    </Typography>
                    <Typography variant="body2">
                      Service: {optimization.service}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                       Savings: ${((optimization.estimated_savings || optimization.savings || 0).toFixed(2))} 
                      {optimization.savings_percentage && (
                        ` (${optimization.savings_percentage}%)`
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {(optimization.description || optimization.suggestion || "").substring(0, 100)}
                      {(optimization.description || optimization.suggestion || "").length > 100 ? '...' : ''}
                    </Typography>
                  </Box>
                ))}
                {effectiveOptimizations.length > 5 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    {effectiveOptimizations.length - 5} more recommendations...
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

      {effectiveOptimizations.length > 0 && (
        <Card>
          <CardHeader title="Top Saving Opportunities" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={effectiveOptimizations
                  .sort((a, b) => ((b.estimated_savings || b.savings || 0) - (a.estimated_savings || a.savings || 0)))
                  .slice(0, 7)
                  .map(o => ({
                    name: o.service,
                    savings: o.estimated_savings || o.savings || 0,
                    category: (o.category?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')) 
                      || formatCategoryName(categorizeByService(o.service))
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