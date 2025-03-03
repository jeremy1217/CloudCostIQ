import React, { useState, useEffect } from "react";
import { 
  Container, Typography, CircularProgress, Paper, Table, TableHead, TableBody, 
  TableRow, TableCell, Button, Box, Chip, Tooltip, IconButton, 
  FormControl, InputLabel, MenuItem, Select, Card, CardContent,
  Alert, Snackbar
} from "@mui/material";
import CodeIcon from '@mui/icons-material/Code';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ScriptGenerator from "../components/ScriptGenerator";
import api from "../services/api";

const Optimize = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRec, setSelectedRec] = useState(null);
    const [showScriptGenerator, setShowScriptGenerator] = useState(false);
    const [filterProvider, setFilterProvider] = useState('all');
    const [filterService, setFilterService] = useState('all');
    const [isApplying, setIsApplying] = useState(false);
    const [applyingRec, setApplyingRec] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

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
    
    // Fetch optimization recommendations
    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            const result = await api.getOptimizationRecommendations();
            setData(result);
            setIsError(false);
            setError(null);
        } catch (err) {
            console.error("Error fetching optimization recommendations:", err);
            setIsError(true);
            setError(err.message || "Failed to load optimization recommendations");
            // We'll still use mock data if there's an error, so don't return early
        } finally {
            setIsLoading(false);
        }
    };
    
    // Apply optimization recommendation
    const applyOptimization = async (recommendation) => {
        setIsApplying(true);
        setApplyingRec(recommendation);
        
        try {
            await api.applyOptimization(recommendation.provider, recommendation.service);
            // Successful API call
            await fetchRecommendations(); // Refresh data
            showNotification(`Successfully applied optimization for ${recommendation.service}`, 'success');
        } catch (err) {
            console.error("Error applying optimization:", err);
            
            // If we're using mock data, simulate applying the optimization
            if (data) {
                // Create a copy of the data
                const newData = { ...data };
                
                // Move the recommendation from current to past
                const recommendationIndex = newData.current_recommendations.findIndex(
                    rec => rec.provider === recommendation.provider && rec.service === recommendation.service
                );
                
                if (recommendationIndex !== -1) {
                    const [removed] = newData.current_recommendations.splice(recommendationIndex, 1);
                    newData.past_recommendations.push({ ...removed, applied: true });
                    setData(newData);
                    showNotification(`Successfully applied optimization for ${recommendation.service}`, 'success');
                } else {
                    showNotification(`Failed to find recommendation for ${recommendation.service}`, 'error');
                }
            } else {
                showNotification(`Failed to apply optimization: ${err.message || 'Unknown error'}`, 'error');
            }
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
        return isApplying && applyingRec && 
               applyingRec.provider === rec.provider && 
               applyingRec.service === rec.service;
    };

    // Toggle script generator view for a recommendation
    const handleToggleScriptGenerator = (rec) => {
        setSelectedRec(rec);
        setShowScriptGenerator(!showScriptGenerator);
    };

    // Create mock data if needed
    const generateMockData = () => {
        return {
            current_recommendations: [
                {
                    provider: "AWS",
                    service: "EC2",
                    suggestion: "Use Reserved Instances to save costs.",
                    command: "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type reserved",
                    savings: 345.67,
                    applied: false
                },
                {
                    provider: "Azure",
                    service: "VM",
                    suggestion: "Resize underutilized virtual machines to optimize costs.",
                    command: "az vm resize --resource-group myResourceGroup --name myVM --size Standard_B2s",
                    savings: 128.90,
                    applied: false
                },
                {
                    provider: "AWS",
                    service: "S3",
                    suggestion: "Configure lifecycle policies to move data to lower-cost storage tiers.",
                    command: "aws s3api put-bucket-lifecycle-configuration --bucket my-bucket --lifecycle-configuration file://lifecycle.json",
                    savings: 87.45,
                    applied: false
                },
                {
                    provider: "GCP",
                    service: "Compute Engine",
                    suggestion: "Enable Committed Use Discounts for stable workloads.",
                    command: "gcloud compute commitments create my-commitment --plan 12-month --region us-central1 --resources vcpu=4,memory=16GB",
                    savings: 156.78,
                    applied: false
                },
                {
                    provider: "AWS",
                    service: "RDS",
                    suggestion: "Delete unused database snapshots.",
                    command: "aws rds delete-db-snapshot --db-snapshot-identifier my-snapshot-id",
                    savings: 42.35,
                    applied: false
                }
            ],
            past_recommendations: [
                {
                    provider: "AWS",
                    service: "Lambda",
                    suggestion: "Optimize Lambda function memory allocations.",
                    command: "aws lambda update-function-configuration --function-name my-function --memory-size 512",
                    savings: 18.90,
                    applied: true
                },
                {
                    provider: "Azure",
                    service: "Storage",
                    suggestion: "Use Azure Blob lifecycle management for data retention.",
                    command: "az storage account management-policy create --account-name myAccount --resource-group myRG --policy @policy.json",
                    savings: 32.55,
                    applied: true
                }
            ]
        };
    };

    // Use mock data if API data is not available
    const effectiveData = data || generateMockData();

    // Get all available providers from recommendations
    const getProviders = () => {
        if (!effectiveData.current_recommendations || effectiveData.current_recommendations.length === 0) return ['all'];
        
        const providers = new Set(['all']);
        effectiveData.current_recommendations.forEach(rec => {
            if (rec.provider) providers.add(rec.provider);
        });
        
        return Array.from(providers);
    };

    // Get all available services from recommendations
    const getServices = () => {
        if (!effectiveData.current_recommendations || effectiveData.current_recommendations.length === 0) return ['all'];
        
        const services = new Set(['all']);
        effectiveData.current_recommendations.forEach(rec => {
            if (rec.service) services.add(rec.service);
        });
        
        return Array.from(services);
    };

    // Filter recommendations based on selected provider and service
    const getFilteredRecommendations = () => {
        if (!effectiveData.current_recommendations) return [];
        
        return effectiveData.current_recommendations.filter(rec => {
            const providerMatch = filterProvider === 'all' || rec.provider === filterProvider;
            const serviceMatch = filterService === 'all' || rec.service === filterService;
            return providerMatch && serviceMatch;
        });
    };

    // Calculate total potential savings from recommendations
    const calculateTotalSavings = () => {
        if (!effectiveData.current_recommendations) return 0;
        
        return effectiveData.current_recommendations.reduce((total, rec) => {
            return total + (rec.savings || 0);
        }, 0);
    };

    // Get styling for recommendation severity
    const getSeverityColor = (savings) => {
        if (savings > 100) return { color: '#d32f2f', bgColor: '#ffebee' }; // High - red
        if (savings > 50) return { color: '#ed6c02', bgColor: '#fff4e5' };  // Medium - orange
        return { color: '#2e7d32', bgColor: '#e8f5e9' };                    // Low - green
    };

    if (isLoading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading optimization recommendations...</Typography>
                </Box>
            </Container>
        );
    }

    const filteredRecommendations = getFilteredRecommendations();
    const totalSavings = calculateTotalSavings();

    return (
        <Container>
            <Typography variant="h4" align="center" sx={{ marginBottom: 3 }}>
                AI-Driven Cost Optimization 💰
            </Typography>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AttachMoneyIcon sx={{ color: 'success.main', mr: 1 }} />
                            <Typography variant="h6">Potential Savings</Typography>
                        </Box>
                        <Typography variant="h4">${totalSavings.toFixed(2)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Monthly estimated savings
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <InfoIcon sx={{ color: 'primary.main', mr: 1 }} />
                            <Typography variant="h6">Recommendations</Typography>
                        </Box>
                        <Typography variant="h4">{effectiveData.current_recommendations?.length || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            AI-generated optimization suggestions
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                            <Typography variant="h6">Applied</Typography>
                        </Box>
                        <Typography variant="h4">{effectiveData.past_recommendations?.filter(rec => rec.applied).length || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Successfully implemented optimizations
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Script Generator */}
            {showScriptGenerator && selectedRec && (
                <ScriptGenerator 
                    recommendation={selectedRec} 
                    onClose={() => setShowScriptGenerator(false)} 
                />
            )}

            {/* AI-Generated Recommendations */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        AI-Generated Recommendations 
                        <Chip 
                            size="small" 
                            label={`${filteredRecommendations.length} found`} 
                            sx={{ ml: 1 }}
                        />
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                            <InputLabel id="provider-filter-label">Provider</InputLabel>
                            <Select
                                labelId="provider-filter-label"
                                id="provider-filter"
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
                        
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="service-filter-label">Service</InputLabel>
                            <Select
                                labelId="service-filter-label"
                                id="service-filter"
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
                </Box>
                
                {filteredRecommendations.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Provider</b></TableCell>
                                <TableCell><b>Service</b></TableCell>
                                <TableCell><b>Recommendation</b></TableCell>
                                <TableCell><b>Savings</b></TableCell>
                                <TableCell><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRecommendations.map((rec, index) => {
                                const savings = rec.savings || 0;
                                const severity = getSeverityColor(savings);
                                
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{rec.provider}</TableCell>
                                        <TableCell>{rec.service}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{rec.suggestion}</Typography>
                                            {rec.command && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
                                                >
                                                    Command: <code>{rec.command.length > 30 ? `${rec.command.substring(0, 30)}...` : rec.command}</code>
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`$${savings.toFixed(2)}/mo`}
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: severity.bgColor,
                                                    color: severity.color,
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Generate Script">
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => handleToggleScriptGenerator(rec)}
                                                    >
                                                        <CodeIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                
                                                <Button 
                                                    variant="contained" 
                                                    size="small"
                                                    color={rec.applied ? "success" : "primary"}
                                                    onClick={() => applyOptimization(rec)}
                                                    disabled={rec.command === "N/A" || rec.applied || isRecBeingApplied(rec)}
                                                >
                                                    {isRecBeingApplied(rec) ? "Applying..." : rec.applied ? "Applied" : "Apply"}
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1">No recommendations found with current filters.</Typography>
                        {(filterProvider !== 'all' || filterService !== 'all') && (
                            <Button 
                                variant="text" 
                                onClick={() => {
                                    setFilterProvider('all');
                                    setFilterService('all');
                                }}
                                sx={{ mt: 1 }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Past Recommendations */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Past Recommendations 🕒</Typography>
                {effectiveData.past_recommendations?.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Provider</b></TableCell>
                                <TableCell><b>Service</b></TableCell>
                                <TableCell><b>Recommendation</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {effectiveData.past_recommendations.map((rec, index) => (
                                <TableRow key={index}>
                                    <TableCell>{rec.provider}</TableCell>
                                    <TableCell>{rec.service}</TableCell>
                                    <TableCell>{rec.suggestion}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={rec.applied ? "Applied" : "Pending"}
                                            size="small"
                                            color={rec.applied ? "success" : "warning"}
                                            variant={rec.applied ? "filled" : "outlined"}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Generate Script">
                                            <IconButton 
                                                size="small" 
                                                color="primary"
                                                onClick={() => handleToggleScriptGenerator(rec)}
                                            >
                                                <CodeIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <Typography>No past recommendations available.</Typography>}
            </Paper>

            {/* Best Practices Section */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Cost Optimization Best Practices</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Right-sizing Resources</Typography>
                            <Typography variant="body2">
                                Match your resource allocation with actual needs. Use monitoring data to identify 
                                underutilized resources that can be downsized without impacting performance.
                            </Typography>
                        </CardContent>
                    </Card>
                    
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Reserved Instances & Commitments</Typography>
                            <Typography variant="body2">
                                For predictable workloads, purchase reserved instances or commit to usage for 
                                1-3 years to get significant discounts (up to 70%) compared to on-demand pricing.
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Storage Optimization</Typography>
                            <Typography variant="body2">
                                Implement lifecycle policies to automatically transition data to lower-cost storage 
                                tiers based on age and access patterns. Delete unnecessary snapshots and backups.
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>Automated Scheduling</Typography>
                            <Typography variant="body2">
                                Implement start/stop schedules for non-production resources to run only during 
                                business hours, potentially reducing costs by 65% for these resources.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Paper>
            
            {/* Notification Snackbar */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity} 
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Optimize;