import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    CircularProgress
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AdminGuard from './AdminGuard';
import { useAuth } from '../../contexts/AuthContext';

const FeatureManagementContent = () => {
    const [features, setFeatures] = useState([]);
    const [usageData, setUsageData] = useState({});
    const [selectedFeature, setSelectedFeature] = useState('');
    const [timeRange, setTimeRange] = useState('7');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchFeatures();
    }, []);

    useEffect(() => {
        if (selectedFeature) {
            fetchUsageData(selectedFeature, timeRange);
        }
    }, [selectedFeature, timeRange]);

    const fetchFeatures = async () => {
        try {
            const response = await fetch('/api/admin/features', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch features');
            }
            
            const data = await response.json();
            setFeatures(data);
            setLoading(false);
        } catch (err) {
            setError('Error loading features');
            setLoading(false);
        }
    };

    const fetchUsageData = async (feature, days) => {
        try {
            const response = await fetch(
                `/api/admin/features/${feature}/usage?days=${days}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch usage data');
            }
            
            const data = await response.json();
            setUsageData(prevData => ({
                ...prevData,
                [feature]: data
            }));
        } catch (err) {
            setError('Error loading usage data');
        }
    };

    const handleFeatureToggle = async (feature, enabled) => {
        try {
            const response = await fetch(`/api/admin/features/${feature}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ enabled })
            });
            
            if (!response.ok) {
                throw new Error('Failed to toggle feature');
            }
            
            // Refresh features list
            fetchFeatures();
        } catch (err) {
            setError('Error updating feature status');
        }
    };

    const handleLimitUpdate = async (feature, limit) => {
        try {
            const response = await fetch(`/api/admin/features/${feature}/limit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ limit })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update limit');
            }
            
            // Refresh features list
            fetchFeatures();
        } catch (err) {
            setError('Error updating feature limit');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Feature Management
            </Typography>

            {/* Feature List */}
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Feature</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Usage Limit</TableCell>
                            <TableCell>Current Usage</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {features.map((feature) => (
                            <TableRow key={feature.name}>
                                <TableCell>{feature.name}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={feature.enabled}
                                        onChange={(e) => handleFeatureToggle(feature.name, e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={feature.limit}
                                        onChange={(e) => handleLimitUpdate(feature.name, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {feature.current_usage} / {feature.limit || '∞'}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedFeature(feature.name)}
                                    >
                                        View Stats
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Usage Statistics */}
            {selectedFeature && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Usage Statistics: {selectedFeature}
                        </Typography>
                        
                        <FormControl sx={{ minWidth: 120, mr: 2 }}>
                            <InputLabel>Time Range</InputLabel>
                            <Select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                label="Time Range"
                            >
                                <MenuItem value="7">Last 7 days</MenuItem>
                                <MenuItem value="30">Last 30 days</MenuItem>
                                <MenuItem value="90">Last 90 days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {usageData[selectedFeature] && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <LineChart
                                        width={800}
                                        height={400}
                                        data={usageData[selectedFeature].daily_usage}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="usage"
                                            stroke="#8884d8"
                                            name="Usage"
                                        />
                                    </LineChart>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="h6" gutterBottom>
                                        Summary
                                    </Typography>
                                    <Box>
                                        <Typography>
                                            Total Usage: {usageData[selectedFeature].total_usage}
                                        </Typography>
                                        <Typography>
                                            Daily Average: {usageData[selectedFeature].daily_average.toFixed(2)}
                                        </Typography>
                                        <Typography>
                                            Peak Usage: {usageData[selectedFeature].peak_usage}
                                        </Typography>
                                        <Typography>
                                            Peak Day: {usageData[selectedFeature].peak_day}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

const FeatureManagement = () => {
    return (
        <AdminGuard>
            <FeatureManagementContent />
        </AdminGuard>
    );
};

export default FeatureManagement; 