import React, { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import AnimatedChart from '../components/AnimatedChart';

const DataVisualizationDemo = () => {
  const [loading, setLoading] = useState(true);

  // Simulated data
  const tableData = [
    { id: 1, service: 'EC2', cost: 1234.56, usage: 720, region: 'us-east-1' },
    { id: 2, service: 'S3', cost: 567.89, usage: 500, region: 'us-west-2' },
    { id: 3, service: 'RDS', cost: 890.12, usage: 600, region: 'eu-west-1' },
    { id: 4, service: 'Lambda', cost: 123.45, usage: 1000000, region: 'us-east-1' },
    { id: 5, service: 'DynamoDB', cost: 456.78, usage: 800, region: 'ap-southeast-1' },
  ];

  const chartData = [
    { name: 'Jan', aws: 4000, azure: 2400, gcp: 1800 },
    { name: 'Feb', aws: 3000, azure: 1398, gcp: 2800 },
    { name: 'Mar', aws: 2000, azure: 9800, gcp: 2200 },
    { name: 'Apr', aws: 2780, azure: 3908, gcp: 2000 },
    { name: 'May', aws: 1890, azure: 4800, gcp: 2181 },
    { name: 'Jun', aws: 2390, azure: 3800, gcp: 2500 },
  ];

  const pieData = [
    { name: 'Compute', value: 4000 },
    { name: 'Storage', value: 3000 },
    { name: 'Database', value: 2000 },
    { name: 'Network', value: 1000 },
    { name: 'Other', value: 500 },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const tableColumns = [
    { id: 'service', label: 'Service', sortable: true },
    { 
      id: 'cost', 
      label: 'Cost', 
      sortable: true,
      render: (value) => `$${value.toLocaleString()}`
    },
    { 
      id: 'usage', 
      label: 'Usage', 
      sortable: true,
      render: (value) => value.toLocaleString()
    },
    { id: 'region', label: 'Region', sortable: true },
  ];

  const chartSeries = [
    { dataKey: 'aws', name: 'AWS' },
    { dataKey: 'azure', name: 'Azure' },
    { dataKey: 'gcp', name: 'GCP' },
  ];

  return (
    <Box>
      <PageHeader
        title="Data Visualization Demo"
        description="Demonstration of various data visualization components"
        breadcrumbs={[
          { text: 'Home', href: '/' },
          { text: 'Data Visualization' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Data Table */}
        <Grid item xs={12}>
          <DataTable
            title="Cloud Services Cost Analysis"
            columns={tableColumns}
            data={tableData}
            loading={loading}
            initialSortBy="cost"
            initialOrder="desc"
            filterableColumns={[
              { id: 'service', label: 'Service' },
              { id: 'region', label: 'Region' },
            ]}
          />
        </Grid>

        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <AnimatedChart
            type="line"
            title="Monthly Cloud Costs Trend"
            subtitle="Cost comparison across cloud providers"
            data={chartData}
            series={chartSeries}
            loading={loading}
            valuePrefix="$"
          />
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <AnimatedChart
            type="bar"
            title="Monthly Cloud Costs Comparison"
            subtitle="Cost breakdown by provider"
            data={chartData}
            series={chartSeries}
            loading={loading}
            valuePrefix="$"
          />
        </Grid>

        {/* Area Chart */}
        <Grid item xs={12} md={6}>
          <AnimatedChart
            type="area"
            title="Cumulative Cloud Costs"
            subtitle="Stacked area chart showing cumulative costs"
            data={chartData}
            series={chartSeries}
            loading={loading}
            valuePrefix="$"
          />
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <AnimatedChart
            type="pie"
            title="Cost Distribution by Service Type"
            subtitle="Breakdown of costs by service category"
            data={pieData}
            series={[{ dataKey: 'value' }]}
            loading={loading}
            valuePrefix="$"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataVisualizationDemo; 