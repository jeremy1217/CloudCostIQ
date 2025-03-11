import React, { useState, useEffect } from "react";
import { 
    Container, Typography, CircularProgress, Box, Chip, Tooltip, 
    FormControl, InputLabel, MenuItem, Select, Card, CardContent,
    Alert, Snackbar, Button, Grid, Divider, LinearProgress
} from "@mui/material";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BoltIcon from '@mui/icons-material/Bolt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import SpeedIcon from '@mui/icons-material/Speed';
import AIRecommendationCard from "../components/AIRecommendationCard";
import aiRecommendations from "../services/aiRecommendations";
import api from "../services/api";

const Optimize = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [filterProvider, setFilterProvider] = useState('all');
    const [filterService, setFilterService] = useState('all');
    const [isApplying, setIsApplying] = useState(false);
    const [applyingRec, setApplyingRec] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to show notifications
    const showNotification = (message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    // Handle closing notifications
    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false
        });
    };
    
    // Fetch AI recommendations
    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            const cloudData = await api.getCloudResourcesData();
            const result = await aiRecommendations.generateRecommendations(cloudData);
            setData(result);
            setIsError(false);
            setError(null);
        } catch (err) {
            console.error("Error fetching AI recommendations:", err);
            setIsError(true);
            setError(err.message || "Failed to load AI recommendations");
            // Use mock data in case of error
            const mockResult = await aiRecommendations.getMockAIRecommendations();
            setData(mockResult);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Generate new AI recommendations
    const generateNewRecommendations = async () => {
        setIsGenerating(true);
        try {
            const cloudData = await api.getCloudResourcesData();
            const result = await aiRecommendations.generateRecommendations(cloudData);
            setData(result);
            showNotification('Successfully generated new AI recommendations', 'success');
        } catch (err) {
            console.error("Error generating new recommendations:", err);
            showNotification('Failed to generate new recommendations', 'error');
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Apply optimization recommendation
    const applyOptimization = async (recommendation) => {
        setIsApplying(true);
        setApplyingRec(recommendation);
        
        try {
            await api.applyOptimization(recommendation.provider, recommendation.service, recommendation.implementation);
            showNotification(`Successfully applied optimization for ${recommendation.service}`, 'success');
            await fetchRecommendations(); // Refresh recommendations
        } catch (err) {
            console.error("Error applying optimization:", err);
            showNotification(`Failed to apply optimization: ${err.message || 'Unknown error'}`, 'error');
        } finally {
            setIsApplying(false);
            setApplyingRec(null);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Check if a recommendation is being applied
    const isRecBeingApplied = (rec) => {
        return isApplying && applyingRec && applyingRec.id === rec.id;
    };

    // Get all available providers from recommendations
    const getProviders = () => {
        if (!data?.recommendations || data.recommendations.length === 0) return ['all'];
        
        const providers = new Set(['all']);
        data.recommendations.forEach(rec => {
            if (rec.provider) providers.add(rec.provider);
        });
        
        return Array.from(providers);
    };

    // Get all available services from recommendations
    const getServices = () => {
        if (!data?.recommendations || data.recommendations.length === 0) return ['all'];
        
        const services = new Set(['all']);
        data.recommendations.forEach(rec => {
            if (rec.service) services.add(rec.service);
        });
        
        return Array.from(services);
    };

    // Filter recommendations based on selected provider and service
    const getFilteredRecommendations = () => {
        if (!data?.recommendations) return [];
        
        return data.recommendations.filter(rec => {
            const providerMatch = filterProvider === 'all' || rec.provider === filterProvider;
            const serviceMatch = filterService === 'all' || rec.service === filterService;
            return providerMatch && serviceMatch;
        });
    };

    if (isLoading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Loading AI recommendations...
                    </Typography>
                </Box>
            </Container>
        );
    }

    const filteredRecommendations = getFilteredRecommendations();

    return (
        <Container maxWidth="xl">
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        AI-Powered Cost Optimization
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AutoFixHighIcon />}
                        onClick={generateNewRecommendations}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate New Recommendations'}
                    </Button>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrendingUpIcon color="primary" />
                                    <Typography variant="h6">
                                        Cost Overview
                                    </Typography>
                                </Box>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 500 }}>
                                    ${data?.metadata?.analysis?.costMetrics?.monthlySpend.toFixed(2)}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={`${data?.metadata?.analysis?.costMetrics?.savingsPercentage.toFixed(1)}% Potential Savings`}
                                        color="success"
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        (${data?.metadata?.totalPotentialSavings.toFixed(2)})
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <StorageIcon color="primary" />
                                    <Typography variant="h6">
                                        Resource Analysis
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 500 }}>
                                            {data?.metadata?.analysis?.resourceMetrics?.optimizableResources}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Optimizable Resources
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 500 }}>
                                            {data?.metadata?.analysis?.resourceMetrics?.totalResources}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Resources
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TimelineIcon color="primary" />
                                    <Typography variant="h6">
                                        Historical Impact
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 500 }}>
                                            ${data?.metadata?.analysis?.historicalTrends?.lastMonthSavings.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Last Month Savings
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`+${data?.metadata?.analysis?.historicalTrends?.savingsGrowth}%`}
                                        color="success"
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {data?.metadata?.analysis?.historicalTrends?.implementedRecommendations} recommendations implemented
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Resource Distribution */}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <PieChartIcon color="primary" />
                                    <Typography variant="h6">
                                        Resource Distribution
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    {Object.entries(data?.metadata?.analysis?.resourceMetrics?.resourceTypes || {}).map(([type, count]) => (
                                        <Grid item xs={6} key={type}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {type}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {count}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(count / data?.metadata?.analysis?.resourceMetrics?.totalResources) * 100}
                                                sx={{ mt: 1 }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <BoltIcon color="primary" />
                                    <Typography variant="h6">
                                        Recommendation Stats
                                    </Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            By Priority
                                        </Typography>
                                        {Object.entries(data?.metadata?.analysis?.recommendationStats?.byPriority || {}).map(([priority, count]) => (
                                            <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Chip
                                                    label={priority}
                                                    size="small"
                                                    color={priority === 'HIGH' ? 'error' : priority === 'MEDIUM' ? 'warning' : 'success'}
                                                />
                                                <Typography variant="body2">{count}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            By Confidence
                                        </Typography>
                                        {Object.entries(data?.metadata?.analysis?.recommendationStats?.byConfidence || {}).map(([level, count]) => (
                                            <Box key={level} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {level}
                                                </Typography>
                                                <Typography variant="body2">{count}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Performance Benchmarks */}
                <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                    Performance Benchmarks
                </Typography>
                <Grid container spacing={3}>
                    {Object.entries(data?.metadata?.analysis?.resourceMetrics?.performanceBenchmarks || {}).map(([type, metrics]) => (
                        <Grid item xs={12} md={4} key={type}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <SpeedIcon color="primary" />
                                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                            {type}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Current Utilization
                                            </Typography>
                                            <Typography variant="body2">
                                                {metrics.averageUtilization}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={metrics.averageUtilization}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: metrics.averageUtilization >= metrics.industryAverage ? 'success.main' : 'warning.main'
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Industry Average
                                            </Typography>
                                            <Typography variant="h6">
                                                {metrics.industryAverage}%
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Optimization Score
                                            </Typography>
                                            <Typography variant="h6" color={metrics.optimizationScore >= 0.8 ? 'success.main' : 'warning.main'}>
                                                {(metrics.optimizationScore * 100).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={metrics.averageUtilization >= metrics.industryAverage ? 'Optimal' : 'Needs Optimization'}
                                        color={metrics.averageUtilization >= metrics.industryAverage ? 'success' : 'warning'}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Filters Section */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Provider</InputLabel>
                    <Select
                        value={filterProvider}
                        label="Provider"
                        onChange={(e) => setFilterProvider(e.target.value)}
                    >
                        {getProviders().map(provider => (
                            <MenuItem key={provider} value={provider}>
                                {provider === 'all' ? 'All Providers' : provider}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Service</InputLabel>
                    <Select
                        value={filterService}
                        label="Service"
                        onChange={(e) => setFilterService(e.target.value)}
                    >
                        {getServices().map(service => (
                            <MenuItem key={service} value={service}>
                                {service === 'all' ? 'All Services' : service}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Recommendations Section */}
            <Box>
                {filteredRecommendations.length > 0 ? (
                    filteredRecommendations.map((recommendation) => (
                        <AIRecommendationCard
                            key={recommendation.id}
                            recommendation={recommendation}
                            onApply={applyOptimization}
                            isApplying={isRecBeingApplied(recommendation)}
                        />
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No recommendations found for the selected filters
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Optimize;