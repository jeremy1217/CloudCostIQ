import React from 'react';
import { Container, Typography, Grid, Paper, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import CostChart from '../components/CostChart';
import TopAnomaliesWidget from '../components/TopAnomaliesWidget';
import TopOptimizationsWidget from '../components/TopOptimizationsWidget';
import ServiceBreakdownWidget from '../components/ServiceBreakdownWidget';

const Dashboard = () => {
    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Cloud Cost Dashboard</Typography>
            </Box>

            {/* Summary metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            $12,498.67
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Cost (30 Days)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            $13,250.89
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Forecasted (Next 30 Days)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="error" gutterBottom>
                            3
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Anomalies Detected
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main" gutterBottom>
                            $446.35
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Potential Savings
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Main content area */}
            <Grid container spacing={3}>
                {/* Cost trend - larger widget */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Cost Trend</Typography>
                            <Button component={Link} to="/costs/by-service" size="small">View Details</Button>
                        </Box>
                        <CostChart />
                    </Paper>
                </Grid>

                {/* Service breakdown */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Top Services</Typography>
                            <Button component={Link} to="/costs/by-service" size="small">View All</Button>
                        </Box>
                        <ServiceBreakdownWidget limit={5} />
                    </Paper>
                </Grid>

                {/* Top anomalies */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Recent Anomalies</Typography>
                            <Button component={Link} to="/insights" size="small">View All</Button>
                        </Box>
                        <TopAnomaliesWidget limit={3} />
                    </Paper>
                </Grid>

                {/* Top optimization opportunities */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Top Savings Opportunities</Typography>
                            <Button component={Link} to="/optimize" size="small">View All</Button>
                        </Box>
                        <TopOptimizationsWidget limit={3} />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;