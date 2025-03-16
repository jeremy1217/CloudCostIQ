import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import FeatureGuard from './FeatureGuard';

const CostAnalytics = () => {
    return (
        <Grid container spacing={3}>
            {/* Basic Cost Analytics - Available to all plans */}
            <Grid item xs={12}>
                <FeatureGuard feature="cost_analytics">
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Basic Cost Analytics</Typography>
                        <Typography>Basic cost analysis and trends</Typography>
                    </Paper>
                </FeatureGuard>
            </Grid>

            {/* Service Breakdown - Available to all plans */}
            <Grid item xs={12} md={6}>
                <FeatureGuard feature="service_breakdown">
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Service Breakdown</Typography>
                        <Typography>Cost breakdown by cloud services</Typography>
                    </Paper>
                </FeatureGuard>
            </Grid>

            {/* Provider Analysis - Available to all plans */}
            <Grid item xs={12} md={6}>
                <FeatureGuard feature="provider_analysis">
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Provider Analysis</Typography>
                        <Typography>Cost analysis by cloud provider</Typography>
                    </Paper>
                </FeatureGuard>
            </Grid>

            {/* Cost Attribution - Professional and Enterprise only */}
            <Grid item xs={12} md={6}>
                <FeatureGuard 
                    feature="cost_attribution"
                    minPlanLevel="professional"
                    fallback={
                        <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
                            <Typography variant="h6" color="text.secondary">
                                Cost Attribution
                            </Typography>
                            <Typography color="text.secondary">
                                Upgrade to Professional plan to access detailed cost attribution
                            </Typography>
                        </Paper>
                    }
                >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Cost Attribution</Typography>
                        <Typography>Advanced cost attribution analysis</Typography>
                    </Paper>
                </FeatureGuard>
            </Grid>

            {/* Multi-Cloud Comparison - Professional and Enterprise only */}
            <Grid item xs={12} md={6}>
                <FeatureGuard 
                    feature="multi_cloud_comparison"
                    minPlanLevel="professional"
                >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Multi-Cloud Comparison</Typography>
                        <Typography>Compare costs across cloud providers</Typography>
                    </Paper>
                </FeatureGuard>
            </Grid>

            {/* AI Insights - Different levels for different plans */}
            <Grid item xs={12}>
                <FeatureGuard feature="ai_insights">
                    {({ currentPlan }) => (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">AI Insights</Typography>
                            <Typography>
                                {currentPlan?.features?.ai_insights === 'basic' && 
                                    'Basic cost optimization recommendations'}
                                {currentPlan?.features?.ai_insights === 'advanced' && 
                                    'Advanced AI-powered cost insights and recommendations'}
                                {currentPlan?.features?.ai_insights === 'custom' && 
                                    'Custom AI models and predictive analytics'}
                            </Typography>
                        </Paper>
                    )}
                </FeatureGuard>
            </Grid>

            {/* Enterprise Features */}
            <Grid item xs={12}>
                <FeatureGuard minPlanLevel="enterprise">
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">Enterprise Analytics Suite</Typography>
                        <Typography>
                            Advanced enterprise features including custom AI training,
                            predictive optimization, and unlimited data retention
                        </Typography>
                    </Paper>
                </FeatureGuard>
            </Grid>
        </Grid>
    );
};

export default CostAnalytics; 