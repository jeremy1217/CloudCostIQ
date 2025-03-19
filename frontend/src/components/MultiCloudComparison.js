import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Paper, Grid, Button, 
         Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
         CircularProgress, Divider, Chip, Alert, Tooltip } from '@mui/material';
import { ArrowForward, Check, Warning, Info, Savings, 
         CompareArrows, MoveToInbox, Cached } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
         Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

// Custom tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`multi-cloud-tabpanel-${index}`}
      aria-labelledby={`multi-cloud-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MultiCloudComparison = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [comparisonData, setComparisonData] = useState(null);
  const [migrationData, setMigrationData] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [serviceMapping, setServiceMapping] = useState(null);

  // Form states for migration analysis
  const [sourceProvider, setSourceProvider] = useState('AWS');
  const [targetProvider, setTargetProvider] = useState('GCP');
  const [resourceConfig, setResourceConfig] = useState({
    compute: { instances: 10, cores: 40, memory: 160 },
    storage: { capacity: 5000 },
    database: { instances: 3, data: 500 },
    networking: { bandwidth: 1000 }
  });

  // Local state instead of Redux state
  const [cloudCredentials, setCloudCredentials] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  // Colors for providers
  const providerColors = {
    'AWS': '#FF9900',
    'GCP': '#4285F4',
    'Azure': '#0089D6'
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Load data based on selected tab
    if (newValue === 0 && !comparisonData) fetchComparisonData();
    if (newValue === 1 && !migrationData) fetchInitialMigrationData();
    if (newValue === 2 && !optimizationData) fetchOptimizationData();
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchComparisonData();
    fetchServiceMapping();
  }, []);

  // Fetch comparison data
  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProviderComparison();
      if (!data) {
        throw new Error('Failed to fetch comparison data');
      }
      setComparisonData(data);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError('Failed to load comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch service mapping
  const fetchServiceMapping = async () => {
    try {
      const data = await api.getServiceMapping();
      if (data) {
        setServiceMapping(data);
      }
    } catch (err) {
      console.error('Error fetching service mapping:', err);
    }
  };

  // Fetch initial migration analysis data
  const fetchInitialMigrationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProviderComparison();
      if (!data) {
        throw new Error('Failed to fetch migration data');
      }
      setMigrationData(data);
    } catch (err) {
      console.error('Error fetching migration data:', err);
      setError('Failed to load migration data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch optimization data
  const fetchOptimizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOptimizationOpportunities();
      if (!data) {
        throw new Error('Failed to fetch optimization data');
      }
      setOptimizationData(data);
    } catch (err) {
      console.error('Error fetching optimization data:', err);
      setError('Failed to load optimization data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update resource configuration
  const handleResourceChange = (category, field, value) => {
    setResourceConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: Number(value)
      }
    }));
  };

  // Run migration analysis
  const runMigrationAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMigrationAnalysis(sourceProvider, targetProvider);
      if (!data) {
        throw new Error('Failed to analyze migration');
      }
      setMigrationData(data);
    } catch (err) {
      console.error('Error analyzing migration:', err);
      setError('Failed to analyze migration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate migration plan
  const generateMigrationPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulated API call
      setTimeout(() => {
        setLoading(false);
        alert('Migration plan generated! Check your downloads folder.');
      }, 1000);
      
    } catch (err) {
      setError('Failed to generate migration plan. Please try again.');
      setLoading(false);
      console.error('Error generating migration plan:', err);
    }
  };

  // Format currency amounts
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percent difference
  const calculatePercentDiff = (a, b) => {
    if (a === 0) return 100;
    return Math.round(((b - a) / a) * 100);
  };

  // Render direct cost comparison tab
  const renderDirectComparison = () => {
    if (!comparisonData) return <CircularProgress />;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Service Cost Comparison
        </Typography>
        
        {/* Service Cost Comparison Chart */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Monthly Costs by Service Category
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData.serviceComparison}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceCategory" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="awsCost" name="AWS" fill={providerColors.AWS} />
                <Bar dataKey="gcpCost" name="GCP" fill={providerColors.GCP} />
                <Bar dataKey="azureCost" name="Azure" fill={providerColors.Azure} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Service Comparison Table */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Detailed Service Cost Comparison
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service Category</TableCell>
                  <TableCell align="right">AWS</TableCell>
                  <TableCell align="right">GCP</TableCell>
                  <TableCell align="right">Azure</TableCell>
                  <TableCell align="right">Lowest Provider</TableCell>
                  <TableCell align="right">Savings vs. Highest</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonData.serviceComparison.map((row) => {
                  const costs = {
                    AWS: row.awsCost,
                    GCP: row.gcpCost,
                    Azure: row.azureCost
                  };
                  const lowestProvider = Object.entries(costs).reduce((a, b) => a[1] < b[1] ? a : b)[0];
                  const highestCost = Math.max(...Object.values(costs));
                  const lowestCost = Math.min(...Object.values(costs));
                  const savings = highestCost - lowestCost;
                  const savingsPercent = calculatePercentDiff(highestCost, lowestCost);
                  
                  return (
                    <TableRow key={row.serviceCategory}>
                      <TableCell component="th" scope="row">
                        {row.serviceCategory}
                      </TableCell>
                      <TableCell align="right" 
                        sx={{ 
                          fontWeight: lowestProvider === 'AWS' ? 'bold' : 'normal',
                          color: lowestProvider === 'AWS' ? 'success.main' : 'inherit'
                        }}>
                        {formatCurrency(row.awsCost)}
                      </TableCell>
                      <TableCell align="right"
                        sx={{ 
                          fontWeight: lowestProvider === 'GCP' ? 'bold' : 'normal',
                          color: lowestProvider === 'GCP' ? 'success.main' : 'inherit'
                        }}>
                        {formatCurrency(row.gcpCost)}
                      </TableCell>
                      <TableCell align="right"
                        sx={{ 
                          fontWeight: lowestProvider === 'Azure' ? 'bold' : 'normal',
                          color: lowestProvider === 'Azure' ? 'success.main' : 'inherit'
                        }}>
                        {formatCurrency(row.azureCost)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={lowestProvider} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          icon={<Check />} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={`${savingsPercent}% less than the highest cost option`}>
                          <Typography color="success.main">
                            {formatCurrency(savings)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell component="th" scope="row">
                    <Typography fontWeight="bold">Total</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {formatCurrency(comparisonData.totalCosts.aws)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {formatCurrency(comparisonData.totalCosts.gcp)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {formatCurrency(comparisonData.totalCosts.azure)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={comparisonData.lowestCostProvider} 
                      size="small" 
                      color="success" 
                      icon={<Check />} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="success.main">
                      {formatCurrency(comparisonData.potentialSavings)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Annual Savings Summary */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'success.light' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" color="white">
                Potential Annual Savings with Optimal Multi-Cloud Approach
              </Typography>
              <Typography variant="body2" color="white" paragraph>
                By selecting the lowest-cost provider for each service category, you could save up to:
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" align="center" color="white">
                {formatCurrency(comparisonData.potentialAnnualSavings)}
              </Typography>
              <Typography variant="body2" align="center" color="white">
                annually compared to your current configuration
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Service Mapping */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Service Equivalents Across Providers
          </Typography>
          {serviceMapping && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service Type</TableCell>
                    <TableCell>AWS</TableCell>
                    <TableCell>GCP</TableCell>
                    <TableCell>Azure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceMapping.map((row) => (
                    <TableRow key={row.serviceType}>
                      <TableCell component="th" scope="row">
                        {row.serviceType}
                      </TableCell>
                      <TableCell>{row.aws}</TableCell>
                      <TableCell>{row.gcp}</TableCell>
                      <TableCell>{row.azure}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    );
  };

  // Render migration analysis tab
  const renderMigrationAnalysis = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Migration Cost Analysis
        </Typography>
        
        {/* Migration Analysis Configuration */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Migration
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Source Provider
                </Typography>
                <div>
                  {['AWS', 'GCP', 'Azure'].map((provider) => (
                    <Button
                      key={provider}
                      variant={sourceProvider === provider ? "contained" : "outlined"}
                      color="primary"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => setSourceProvider(provider)}
                    >
                      {provider}
                    </Button>
                  ))}
                </div>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Target Provider
                </Typography>
                <div>
                  {['AWS', 'GCP', 'Azure'].map((provider) => (
                    <Button
                      key={provider}
                      variant={targetProvider === provider ? "contained" : "outlined"}
                      color="primary"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      disabled={provider === sourceProvider}
                      onClick={() => setTargetProvider(provider)}
                    >
                      {provider}
                    </Button>
                  ))}
                </div>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Resource Configuration
              </Typography>
            </Grid>

            {/* Compute Resources */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Compute Resources
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Number of Instances</Typography>
                      <input
                        type="number"
                        value={resourceConfig.compute.instances}
                        onChange={(e) => handleResourceChange('compute', 'instances', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Total vCPU Cores</Typography>
                      <input
                        type="number"
                        value={resourceConfig.compute.cores}
                        onChange={(e) => handleResourceChange('compute', 'cores', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Total Memory (GB)</Typography>
                      <input
                        type="number"
                        value={resourceConfig.compute.memory}
                        onChange={(e) => handleResourceChange('compute', 'memory', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Storage Resources */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Storage Resources
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Total Capacity (GB)</Typography>
                      <input
                        type="number"
                        value={resourceConfig.storage.capacity}
                        onChange={(e) => handleResourceChange('storage', 'capacity', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Database Resources */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Database Resources
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Number of Instances</Typography>
                      <input
                        type="number"
                        value={resourceConfig.database.instances}
                        onChange={(e) => handleResourceChange('database', 'instances', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Total Data (GB)</Typography>
                      <input
                        type="number"
                        value={resourceConfig.database.data}
                        onChange={(e) => handleResourceChange('database', 'data', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Networking Resources */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Networking Resources
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <label>
                      <Typography variant="body2">Data Transfer (GB/month)</Typography>
                      <input
                        type="number"
                        value={resourceConfig.networking.bandwidth}
                        onChange={(e) => handleResourceChange('networking', 'bandwidth', e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      />
                    </label>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={runMigrationAnalysis}
                disabled={loading}
                startIcon={<CompareArrows />}
              >
                {loading ? 'Analyzing...' : 'Analyze Migration'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Migration Analysis Results */}
        {migrationData && (
          <>
            <Paper sx={{ p: 2, mb: 3, backgroundColor: 'primary.light' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" color="white">
                    Migration Summary: {sourceProvider} → {targetProvider}
                  </Typography>
                  <Typography variant="body2" color="white">
                    Based on your resource configuration, we've analyzed the cost and benefits of migration.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Break-Even Point
                    </Typography>
                    <Typography variant="h4" color="success.main" align="center">
                      {migrationData.breakEvenMonths} months
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    One-Time Migration Costs
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {formatCurrency(migrationData.oneTimeCosts.total)}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Labor Costs</TableCell>
                        <TableCell align="right">{formatCurrency(migrationData.oneTimeCosts.labor)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Data Transfer</TableCell>
                        <TableCell align="right">{formatCurrency(migrationData.oneTimeCosts.dataTransfer)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tools & Services</TableCell>
                        <TableCell align="right">{formatCurrency(migrationData.oneTimeCosts.tools)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Training</TableCell>
                        <TableCell align="right">{formatCurrency(migrationData.oneTimeCosts.training)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Monthly Cost Comparison
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Current ({sourceProvider})</Typography>
                      <Typography variant="h5">
                        {formatCurrency(migrationData.monthlyCosts.current)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Projected ({targetProvider})</Typography>
                      <Typography variant="h5" color={migrationData.monthlyCosts.projected < migrationData.monthlyCosts.current ? 'success.main' : 'error.main'}>
                        {formatCurrency(migrationData.monthlyCosts.projected)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">Monthly Savings</Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(migrationData.monthlyCosts.savings)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({Math.round((migrationData.monthlyCosts.savings / migrationData.monthlyCosts.current) * 100)}% reduction)
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    ROI Analysis
                  </Typography>
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="body2">3-Year Net Savings</Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(migrationData.roi.threeYearSavings)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>1-Year ROI</TableCell>
                        <TableCell align="right">{migrationData.roi.oneYearRoi}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3-Year ROI</TableCell>
                        <TableCell align="right">{migrationData.roi.threeYearRoi}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>5-Year ROI</TableCell>
                        <TableCell align="right">{migrationData.roi.fiveYearRoi}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>

            {/* Cumulative Cost Comparison Chart */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cumulative Cost Comparison Over Time
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={migrationData.cumulativeCostComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value/1000}k`} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="currentCost" 
                      name={`Current (${sourceProvider})`} 
                      stroke={providerColors[sourceProvider]} 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projectedCost" 
                      name={`Projected (${targetProvider})`} 
                      stroke={providerColors[targetProvider]} 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="breakEvenPoint" 
                      name="Break-Even Point" 
                      stroke="#00C853" 
                      strokeDasharray="5 5" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* Migration Complexity Assessment */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Migration Complexity Assessment
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Resource Type</TableCell>
                      <TableCell>Complexity</TableCell>
                      <TableCell>Estimated Effort</TableCell>
                      <TableCell>Key Considerations</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {migrationData.complexityAssessment.map((item) => (
                      <TableRow key={item.resourceType}>
                        <TableCell>{item.resourceType}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.complexity} 
                            size="small" 
                            color={
                              item.complexity === 'High' ? 'error' : 
                              item.complexity === 'Medium' ? 'warning' : 'success'
                            } 
                          />
                        </TableCell>
                        <TableCell>{item.estimatedEffort}</TableCell>
                        <TableCell>{item.keyConsiderations}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Migration Strategy */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recommended Migration Strategy
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" paragraph>
                  Based on your resource configuration, we recommend a phased approach to migration:
                </Typography>
                <ol>
                  {migrationData.recommendedStrategy.phases.map((phase, index) => (
                    <li key={index} style={{ marginBottom: '16px' }}>
                      <Typography variant="subtitle2">{phase.title}</Typography>
                      <Typography variant="body2">{phase.description}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Duration: {phase.duration}
                      </Typography>
                    </li>
                  ))}
                </ol>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={generateMigrationPlan}
                disabled={loading}
                startIcon={<MoveToInbox />}
              >
                Generate Detailed Migration Plan
              </Button>
            </Paper>
          </>
        )}
      </Box>
    );
  };

  // Render cross-cloud optimization tab
  const renderCrossCloudOptimization = () => {
    if (!optimizationData && !loading) {
      fetchOptimizationData();
      return <CircularProgress />;
    }
    
    if (!optimizationData) return <CircularProgress />;

    // COLORS for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Cross-Cloud Optimization Opportunities
        </Typography>
        
        {/* Overall Savings Summary */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'success.light' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" color="white">
                Potential Monthly Savings with Multi-Cloud Strategy
              </Typography>
              <Typography variant="body2" color="white" paragraph>
                By optimizing workloads across multiple cloud providers, you could save up to:
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h4" align="center" color="white">
                {formatCurrency(optimizationData.totalMonthlySavings)}
              </Typography>
              <Typography variant="body2" align="center" color="white">
                monthly ({Math.round((optimizationData.totalMonthlySavings / optimizationData.currentMonthlyCost) * 100)}% of current costs)
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Current vs. Optimized Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Cost Distribution by Provider
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={optimizationData.currentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="provider"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {optimizationData.currentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={providerColors[entry.provider] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Total: {formatCurrency(optimizationData.currentMonthlyCost)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Optimized Cost Distribution by Provider
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={optimizationData.optimizedDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="provider"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {optimizationData.optimizedDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={providerColors[entry.provider] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Total: {formatCurrency(optimizationData.optimizedMonthlyCost)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Optimization Opportunities Table */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Specific Optimization Opportunities
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Opportunity</TableCell>
                  <TableCell>Current Provider</TableCell>
                  <TableCell>Recommended Provider</TableCell>
                  <TableCell>Monthly Savings</TableCell>
                  <TableCell>Implementation Complexity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {optimizationData.opportunities.map((opportunity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {opportunity.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opportunity.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={opportunity.currentProvider} 
                        size="small"
                        style={{ backgroundColor: providerColors[opportunity.currentProvider], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={opportunity.recommendedProvider} 
                        size="small"
                        style={{ backgroundColor: providerColors[opportunity.recommendedProvider], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {formatCurrency(opportunity.monthlySavings)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={opportunity.complexity} 
                        size="small" 
                        color={
                          opportunity.complexity === 'High' ? 'error' : 
                          opportunity.complexity === 'Medium' ? 'warning' : 'success'
                        } 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        endIcon={<Info />}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Implementation Considerations */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Multi-Cloud Implementation Considerations
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Benefits
              </Typography>
              <ul>
                {optimizationData.implementationConsiderations.benefits.map((benefit, index) => (
                  <li key={index}>
                    <Typography variant="body2">{benefit}</Typography>
                  </li>
                ))}
              </ul>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Challenges
              </Typography>
              <ul>
                {optimizationData.implementationConsiderations.challenges.map((challenge, index) => (
                  <li key={index}>
                    <Typography variant="body2">{challenge}</Typography>
                  </li>
                ))}
              </ul>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Recommended Tools
          </Typography>
          <Grid container spacing={2}>
            {optimizationData.implementationConsiderations.recommendedTools.map((tool, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {tool.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="multi-cloud comparison tabs"
        >
          <Tab 
            label="Direct Cost Comparison" 
            icon={<CompareArrows />} 
            iconPosition="start"
          />
          <Tab 
            label="Migration Analysis" 
            icon={<MoveToInbox />} 
            iconPosition="start"
          />
          <Tab 
            label="Cross-Cloud Optimization" 
            icon={<Cached />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      <TabPanel value={tabValue} index={0}>
        {renderDirectComparison()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderMigrationAnalysis()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderCrossCloudOptimization()}
      </TabPanel>
    </Box>
  );
};

export default MultiCloudComparison;