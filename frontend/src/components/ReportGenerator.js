import React, { useState } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    Chip
} from '@mui/material';
import FeatureGuard from './FeatureGuard';

const ReportGenerator = () => {
    const [days, setDays] = useState(30);
    const [format, setFormat] = useState('csv');
    const [includePredictions, setIncludePredictions] = useState(false);
    
    const handleGenerateReport = () => {
        // API call implementation
    };
    
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Cost Report Generator
            </Typography>
            
            {/* Basic Report Options - Available to all plans */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Days of Data"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        inputProps={{ min: 1 }}
                    />
                </Grid>
                
                {/* Export Format Selection - Restricted by plan */}
                <Grid item xs={12} md={6}>
                    <FeatureGuard feature="export_formats">
                        {({ currentPlan }) => (
                            <FormControl fullWidth>
                                <InputLabel>Export Format</InputLabel>
                                <Select
                                    value={format}
                                    onChange={(e) => setFormat(e.target.value)}
                                    label="Export Format"
                                >
                                    <MenuItem value="csv">CSV</MenuItem>
                                    {currentPlan?.features?.export_formats?.includes('excel') && (
                                        <MenuItem value="excel">Excel</MenuItem>
                                    )}
                                    {currentPlan?.features?.export_formats?.includes('pdf') && (
                                        <MenuItem value="pdf">PDF</MenuItem>
                                    )}
                                    {currentPlan?.features?.export_formats?.includes('custom') && (
                                        <MenuItem value="custom">Custom Format</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        )}
                    </FeatureGuard>
                </Grid>
                
                {/* Advanced Options - Professional and Enterprise only */}
                <Grid item xs={12}>
                    <FeatureGuard 
                        feature="advanced_analytics"
                        minPlanLevel="professional"
                    >
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Advanced Options
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Include Team Attribution</InputLabel>
                                        <Select defaultValue="basic">
                                            <MenuItem value="basic">Basic Attribution</MenuItem>
                                            <MenuItem value="detailed">Detailed Attribution</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Metrics Detail Level</InputLabel>
                                        <Select defaultValue="summary">
                                            <MenuItem value="summary">Summary</MenuItem>
                                            <MenuItem value="detailed">Detailed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </FeatureGuard>
                </Grid>
                
                {/* Enterprise Features */}
                <Grid item xs={12}>
                    <FeatureGuard minPlanLevel="enterprise">
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Enterprise Features
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>AI Insights Level</InputLabel>
                                        <Select defaultValue="basic">
                                            <MenuItem value="basic">Basic Insights</MenuItem>
                                            <MenuItem value="advanced">Advanced Insights</MenuItem>
                                            <MenuItem value="custom">Custom AI Models</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Include Predictions</InputLabel>
                                        <Select
                                            value={includePredictions}
                                            onChange={(e) => setIncludePredictions(e.target.value)}
                                        >
                                            <MenuItem value={false}>No Predictions</MenuItem>
                                            <MenuItem value={true}>Include Predictions</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </FeatureGuard>
                </Grid>
                
                {/* Feature Information */}
                <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Available Features:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <FeatureGuard feature="basic_analytics">
                                <Chip label="Basic Analytics" color="primary" />
                            </FeatureGuard>
                            <FeatureGuard feature="cost_attribution">
                                <Chip label="Cost Attribution" color="primary" />
                            </FeatureGuard>
                            <FeatureGuard feature="advanced_analytics">
                                <Chip label="Advanced Analytics" color="primary" />
                            </FeatureGuard>
                            <FeatureGuard minPlanLevel="enterprise">
                                <Chip label="AI Predictions" color="primary" />
                            </FeatureGuard>
                        </Box>
                    </Box>
                </Grid>
                
                {/* Generate Report Button */}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleGenerateReport}
                    >
                        Generate Report
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ReportGenerator; 