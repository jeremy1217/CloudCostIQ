import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import api from '../services/api';

const CostAttribution = () => {
  const [attributionData, setAttributionData] = useState([]);
  const [untaggedResources, setUntaggedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attributionType, setAttributionType] = useState('team');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!api) {
          throw new Error('API service not initialized');
        }
        const [attribution, untagged] = await Promise.all([
          api.getCostAttribution(attributionType, timeRange),
          api.getUntaggedResources()
        ]);
        setAttributionData(attribution || []);
        setUntaggedResources(untagged || []);
      } catch (err) {
        setError('Failed to fetch cost attribution data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attributionType, timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Attribution Type</InputLabel>
            <Select
              value={attributionType}
              label="Attribution Type"
              onChange={(e) => setAttributionType(e.target.value)}
            >
              <MenuItem value="team">Team</MenuItem>
              <MenuItem value="project">Project</MenuItem>
              <MenuItem value="department">Department</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {attributionData.map((item, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="h4" color="primary">
                  ${item.cost.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">
                  {item.percentage}% of total costs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {untaggedResources.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Untagged Resources
          </Typography>
          <Grid container spacing={2}>
            {untaggedResources.map((resource, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {resource.name}
                    </Typography>
                    <Typography color="textSecondary">
                      Cost: ${resource.cost.toFixed(2)}
                    </Typography>
                    <Typography color="textSecondary">
                      Provider: {resource.provider}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default CostAttribution;