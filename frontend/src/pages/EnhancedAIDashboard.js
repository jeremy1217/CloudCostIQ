import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import EnhancedAIDashboardComponent from '../components/EnhancedAIDashboard';

const EnhancedAIDashboardPage = () => {
    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Advanced AI Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Comprehensive AI-powered analytics and insights
                </Typography>
            </Box>
            
            <EnhancedAIDashboardComponent />
        </Container>
    );
};

export default EnhancedAIDashboardPage;