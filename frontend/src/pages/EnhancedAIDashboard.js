import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
// Updated import path to match the export from the fixed file
import EnhancedAIDashboard from '../components/EnhancedAIDashboard';

const EnhancedAIDashboardPage = () => {
    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    CloudCostIQ Enhanced AI Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Leveraging advanced AI/ML for cost forecasting, anomaly detection, and optimization recommendations
                </Typography>
            </Box>
            
            <Paper elevation={2}>
                <EnhancedAIDashboard />
            </Paper>
            
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Note: This dashboard is currently running with simulated data during development. 
                    Once the backend AI services are fully deployed, it will automatically connect to live data.
                </Typography>
            </Box>
        </Container>
    );
};

export default EnhancedAIDashboardPage;