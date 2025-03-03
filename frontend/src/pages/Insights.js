import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import AnomalyDetection from '../components/AnomalyDetection';
import CostForecasting from '../components/CostForecasting';
import AiStatusCard from '../components/AiStatusCard';

const Insights = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>AI-Powered Insights</Typography>
            
            {/* AI Status Card */}
            <AiStatusCard sx={{ mb: 3 }} />
            
            {/* Tabs for different insight types */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Anomaly Detection" />
                    <Tab label="Cost Forecasting" />
                    <Tab label="Cost Trends" />
                </Tabs>
            </Box>
            
            {/* Tab content */}
            {activeTab === 0 && <AnomalyDetection />}
            {activeTab === 1 && <CostForecasting />}
            {activeTab === 2 && <div>Cost Trends Analysis</div>}
        </Container>
    );
};

export default Insights;