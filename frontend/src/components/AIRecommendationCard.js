import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    LinearProgress,
    Tooltip,
    Divider,
    Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import BoltIcon from '@mui/icons-material/Bolt';
import TimelineIcon from '@mui/icons-material/Timeline';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedIcon from '@mui/icons-material/Speed';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import { styled } from '@mui/material/styles';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const MetricBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1)
}));

const BenchmarkProgress = styled(LinearProgress)(({ theme, value, optimal, industry }) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        backgroundColor: 
            value >= optimal ? theme.palette.success.main :
            value >= industry ? theme.palette.warning.main :
            theme.palette.error.main
    }
}));

const AIRecommendationCard = ({ recommendation, onApply, isApplying }) => {
    const [expanded, setExpanded] = useState(false);
    const [showImplementation, setShowImplementation] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const getPriorityColor = (priority) => {
        switch (priority.toUpperCase()) {
            case 'HIGH':
                return { color: '#d32f2f', bgColor: '#ffebee' };
            case 'MEDIUM':
                return { color: '#ed6c02', bgColor: '#fff4e5' };
            case 'LOW':
                return { color: '#2e7d32', bgColor: '#e8f5e9' };
            default:
                return { color: '#1976d2', bgColor: '#e3f2fd' };
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.9) return '#2e7d32';
        if (confidence >= 0.7) return '#ed6c02';
        return '#d32f2f';
    };

    return (
        <Card sx={{ mb: 2, boxShadow: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                                label={recommendation.provider}
                                size="small"
                                sx={{ fontWeight: 500 }}
                            />
                            <Chip
                                label={recommendation.service}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                label={recommendation.priority}
                                size="small"
                                sx={{
                                    color: getPriorityColor(recommendation.priority).color,
                                    bgcolor: getPriorityColor(recommendation.priority).bgColor,
                                    fontWeight: 500,
                                }}
                            />
                        </Box>
                        <Typography variant="h6" gutterBottom>
                            {recommendation.suggestion}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 500 }}>
                            ${recommendation.estimatedSavings.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Estimated Savings
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Tooltip title="AI Confidence Score">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BoltIcon sx={{ color: getConfidenceColor(recommendation.confidence) }} />
                            <Box sx={{ flex: 1, width: 100 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={recommendation.confidence * 100}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: getConfidenceColor(recommendation.confidence),
                                        },
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {(recommendation.confidence * 100).toFixed(0)}%
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onApply(recommendation)}
                        disabled={isApplying}
                        startIcon={<CheckCircleOutlineIcon />}
                    >
                        {isApplying ? 'Applying...' : 'Apply'}
                    </Button>

                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pt: 1 }}>
                        {/* Cost Trend Analysis */}
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>
                            Cost Analysis
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <MetricBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingDownIcon color="primary" />
                                        <Typography variant="subtitle2">Cost Trend</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Current Monthly Cost
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            ${recommendation.metrics?.costTrend?.current.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Projected Cost
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            ${recommendation.metrics?.costTrend?.projected.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${Math.abs(recommendation.metrics?.costTrend?.trend)}% Reduction`}
                                        color="success"
                                        size="small"
                                        sx={{ alignSelf: 'flex-start' }}
                                    />
                                </MetricBox>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <MetricBox>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTimeIcon color="primary" />
                                        <Typography variant="subtitle2">ROI Analysis</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Implementation Effort
                                            </Typography>
                                            <Chip
                                                label={recommendation.metrics?.roi?.implementationEffort}
                                                size="small"
                                                color={recommendation.metrics?.roi?.implementationEffort === 'LOW' ? 'success' : 'warning'}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Payback Period
                                            </Typography>
                                            <Typography variant="body2">
                                                {recommendation.metrics?.roi?.paybackPeriod}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Risk Level
                                            </Typography>
                                            <Chip
                                                label={recommendation.metrics?.roi?.riskLevel}
                                                size="small"
                                                color={recommendation.metrics?.roi?.riskLevel === 'LOW' ? 'success' : 'warning'}
                                            />
                                        </Box>
                                    </Box>
                                </MetricBox>
                            </Grid>
                        </Grid>

                        {/* Performance Metrics */}
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                            Performance Benchmarks
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12}>
                                <MetricBox>
                                    {/* Resource Specifications */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Resource Specifications
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {Object.entries(recommendation.metrics?.performance?.resourceSpecific || {}).map(([key, value]) => (
                                                <Grid item xs={6} key={key}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {value}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Benchmark Comparisons */}
                                    <Typography variant="subtitle2" gutterBottom>
                                        Performance Benchmarks
                                    </Typography>
                                    <Grid container spacing={3}>
                                        {Object.entries(recommendation.metrics?.performance?.benchmarks || {}).map(([metric, data]) => (
                                            <Grid item xs={12} key={metric}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                                                            {metric}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            <Chip
                                                                size="small"
                                                                label={`Current: ${data.current}${metric === 'iops' ? '' : '%'}`}
                                                                color={data.current >= data.optimal ? 'success' : data.current >= data.industry ? 'warning' : 'error'}
                                                            />
                                                            <Chip
                                                                size="small"
                                                                label={`Industry: ${data.industry}${metric === 'iops' ? '' : '%'}`}
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                size="small"
                                                                label={`Optimal: ${data.optimal}${metric === 'iops' ? '' : '%'}`}
                                                                variant="outlined"
                                                                color="success"
                                                            />
                                                        </Box>
                                                    </Box>
                                                    <BenchmarkProgress
                                                        variant="determinate"
                                                        value={(data.current / data.optimal) * 100}
                                                        optimal={data.optimal}
                                                        industry={data.industry}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Industry Comparison */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Industry Analysis
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <CompareArrowsIcon color="primary" />
                                                    <Typography variant="body2">
                                                        {recommendation.benchmarkAnalysis?.summary}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <MetricBox>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Industry Percentile
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h6">
                                                            {recommendation.benchmarkAnalysis?.industryComparison?.percentile}th
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            percentile
                                                        </Typography>
                                                    </Box>
                                                </MetricBox>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <MetricBox>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Efficiency Score
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h6">
                                                            {(recommendation.benchmarkAnalysis?.industryComparison?.efficiencyScore * 100).toFixed(0)}%
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={recommendation.benchmarkAnalysis?.industryComparison?.similarWorkloads}
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </MetricBox>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Potential Improvements */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Expected Impact
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {Object.entries(recommendation.benchmarkAnalysis?.potentialImprovements || {}).map(([category, impact]) => (
                                                <Grid item xs={12} key={category}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <BarChartIcon color="primary" />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                                {category}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {impact}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </MetricBox>
                            </Grid>
                        </Grid>

                        {/* Implementation Details */}
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                            Implementation Details
                        </Typography>
                        <MetricBox sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Estimated Duration
                                </Typography>
                                <Typography variant="body1">
                                    {recommendation.implementation?.estimatedDuration}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Required Permissions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                {recommendation.implementation?.requiredPermissions?.map((permission, index) => (
                                    <Chip
                                        key={index}
                                        label={permission}
                                        size="small"
                                        icon={<SecurityIcon />}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </MetricBox>

                        {/* Original AI Analysis and Implementation sections */}
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                            AI Analysis
                        </Typography>
                        <List dense>
                            {recommendation.reasoning.map((reason, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <TimelineIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={reason} />
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<CodeIcon />}
                                onClick={() => setShowImplementation(!showImplementation)}
                                sx={{ mb: 2 }}
                            >
                                {showImplementation ? 'Hide Implementation' : 'Show Implementation'}
                            </Button>

                            <Collapse in={showImplementation}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>
                                    Implementation Steps
                                </Typography>
                                <List dense>
                                    {recommendation.implementation.steps.map((step, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <TrendingUpIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary={step} />
                                        </ListItem>
                                    ))}
                                </List>

                                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
                                    Command
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: 'grey.900',
                                        color: 'grey.100',
                                        p: 2,
                                        borderRadius: 1,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                    }}
                                >
                                    {recommendation.implementation.command}
                                </Box>
                            </Collapse>
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default AIRecommendationCard; 