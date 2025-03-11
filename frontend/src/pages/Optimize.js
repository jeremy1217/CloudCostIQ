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
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AIRecommendationCard from "../components/AIRecommendationCard";
import aiRecommendations from "../services/aiRecommendations";
import api from "../services/api";
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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

                                    {/* Main Utilization */}
                                    <Box sx={{ mb: 3 }}>
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

                                    {/* Detailed Metrics */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AssessmentIcon fontSize="small" color="primary" />
                                            Efficiency Metrics
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {Object.entries(metrics.details || {}).map(([key, value]) => (
                                                <Grid item xs={6} key={key}>
                                                    <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {typeof value === 'number' ? `${(value * 100).toFixed(0)}%` : value}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    {/* Trends */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrendingUpIcon fontSize="small" color="primary" />
                                            Performance Trends
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {Object.entries(metrics.trends || {}).map(([period, values]) => (
                                                <Grid item xs={12} key={period}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
                                                            {period}
                                                        </Typography>
                                                        <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                                                            {values.map((value, index) => (
                                                                <Box
                                                                    key={index}
                                                                    sx={{
                                                                        flex: 1,
                                                                        height: 24,
                                                                        bgcolor: 'primary.main',
                                                                        opacity: 0.1 + (0.9 * value / 100),
                                                                        borderRadius: 0.5
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography variant="body2">
                                                            {values[values.length - 1]}%
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Summary */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

                {/* Cost-Performance Analysis */}
                <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                    Cost-Performance Analysis
                </Typography>
                
                {/* Overview Card */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CompareArrowsIcon color="primary" />
                            <Typography variant="h6">
                                Overall Cost-Performance Ratio
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ position: 'relative', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                    <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                                        {(data?.metadata?.analysis?.costPerformanceMetrics?.overview?.costPerformanceScore * 100).toFixed(0)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Cost-Performance Score
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Industry Benchmark: {(data?.metadata?.analysis?.costPerformanceMetrics?.overview?.industryBenchmark * 100).toFixed(0)}%
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(data?.metadata?.analysis?.costPerformanceMetrics?.overview?.costPerformanceScore / data?.metadata?.analysis?.costPerformanceMetrics?.overview?.industryBenchmark) * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'primary.main'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Monthly Trend
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                                            {data?.metadata?.analysis?.costPerformanceMetrics?.overview?.monthlyTrend.map((value, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        flex: 1,
                                                        height: 40,
                                                        bgcolor: 'primary.main',
                                                        opacity: 0.3 + (0.7 * value),
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center',
                                                        pb: 0.5
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                                                        {(value * 100).toFixed(0)}%
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Chip
                                            icon={<TrendingUpIcon />}
                                            label={`${data?.metadata?.analysis?.costPerformanceMetrics?.overview?.potentialImprovement}% Potential Improvement`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<ShowChartIcon />}
                                            label={`${data?.metadata?.analysis?.costPerformanceMetrics?.industryComparison?.percentile}th Percentile`}
                                            color="success"
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Resource Type Analysis */}
                <Grid container spacing={3}>
                    {Object.entries(data?.metadata?.analysis?.costPerformanceMetrics?.resourceTypes || {}).map(([type, metrics]) => (
                        <Grid item xs={12} md={4} key={type}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <MoneyOffIcon color="primary" />
                                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                            {type} Efficiency
                                        </Typography>
                                    </Box>

                                    {/* Cost Metrics */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Cost Metrics
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {Object.entries(metrics.metrics || {}).map(([key, value]) => (
                                                <Grid item xs={6} key={key}>
                                                    <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            ${typeof value === 'number' ? value.toFixed(3) : value}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    {/* Performance Cost Ratio */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Performance/Cost Ratio
                                            </Typography>
                                            <Typography variant="body2">
                                                {(metrics.performanceCostRatio * 100).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={metrics.performanceCostRatio * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: metrics.performanceCostRatio >= 0.85 ? 'success.main' : 'warning.main'
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Trends */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Efficiency Trends
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {Object.entries(metrics.trends || {}).map(([period, values]) => (
                                                <Grid item xs={12} key={period}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
                                                            {period}
                                                        </Typography>
                                                        <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                                                            {values.map((value, index) => (
                                                                <Box
                                                                    key={index}
                                                                    sx={{
                                                                        flex: 1,
                                                                        height: 24,
                                                                        bgcolor: 'primary.main',
                                                                        opacity: 0.1 + (0.9 * value),
                                                                        borderRadius: 0.5
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography variant="body2">
                                                            {(values[values.length - 1] * 100).toFixed(0)}%
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Industry Comparison */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Industry Average
                                            </Typography>
                                            <Typography variant="h6">
                                                {(data?.metadata?.analysis?.costPerformanceMetrics?.industryComparison?.benchmarks[type]?.industry * 100).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Best in Class
                                            </Typography>
                                            <Typography variant="h6" color="success.main">
                                                {(data?.metadata?.analysis?.costPerformanceMetrics?.industryComparison?.benchmarks[type]?.bestInClass * 100).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Optimization Recommendations */}
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TrendingDownIcon color="primary" />
                            <Typography variant="h6">
                                Cost-Performance Optimization Opportunities
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                            {data?.metadata?.analysis?.costPerformanceMetrics?.recommendations.map((rec, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {rec.type}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Potential Savings
                                            </Typography>
                                            <Typography variant="body1" color="success.main">
                                                ${rec.potentialSavings.toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                ROI
                                            </Typography>
                                            <Typography variant="body1">
                                                {rec.roi}x
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <Chip
                                                label={`Impact: ${rec.performanceImpact}`}
                                                color={rec.performanceImpact === 'Positive' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                            <Chip
                                                label={`${rec.implementationComplexity} Complexity`}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Leading Practices */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Industry Leading Practices
                            </Typography>
                            <Grid container spacing={2}>
                                {data?.metadata?.analysis?.costPerformanceMetrics?.industryComparison?.leadingPractices.map((practice, index) => (
                                    <Grid item xs={12} md={4} key={index}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <CheckCircleOutlineIcon color="success" />
                                            <Typography variant="body2">
                                                {practice}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
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