import React from 'react';
import { Box, Typography } from '@mui/material';
import api from '../services/api';
import { useEffect, useState } from 'react';

const ServiceBreakdownWidget = ({ limit = 5 }) => {
    const [services, setServices] = useState([]);
    
    useEffect(() => {
        // Fetch services data using the API service
        const fetchData = async () => {
            try {
                const response = await api.getCloudCosts();
                
                if (!response || !response.costs) {
                    throw new Error('Invalid cost data structure');
                }

                // Process the data
                const serviceSummary = response.costs.reduce((acc, item) => {
                    // Group by service and provider
                    const serviceKey = `${item.provider} - ${item.service}`;
                    if (!acc[serviceKey]) {
                        acc[serviceKey] = 0;
                    }
                    acc[serviceKey] += item.cost;
                    return acc;
                }, {});
                
                // Convert to array and sort by cost (descending)
                const sortedServices = Object.entries(serviceSummary)
                    .map(([service, cost]) => ({ service, cost }))
                    .sort((a, b) => b.cost - a.cost);
                
                // Calculate total for percentages
                const total = sortedServices.reduce((sum, { cost }) => sum + cost, 0);
                
                // Add percentage and limit to requested number
                const formattedServices = sortedServices
                    .slice(0, limit)
                    .map(item => ({
                        ...item,
                        percentage: (item.cost / total) * 100,
                        cost: parseFloat(item.cost.toFixed(2))
                    }));
                
                setServices(formattedServices);
            } catch (error) {
                console.error("Error fetching service breakdown data:", error);
                
                // Fallback mock data
                setServices([
                    { service: 'AWS - EC2', cost: 4587.23, percentage: 36.7 },
                    { service: 'AWS - S3', cost: 2145.67, percentage: 17.2 },
                    { service: 'AWS - RDS', cost: 3256.78, percentage: 26.1 },
                    { service: 'Azure - VM', cost: 1234.56, percentage: 9.9 },
                    { service: 'GCP - Compute Engine', cost: 1274.43, percentage: 10.1 }
                ].slice(0, limit));
            }
        };
        
        fetchData();
    }, [limit]);

    // Colors for the bars
    const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#6b7280'];

    return (
        <Box>
            {services.map((service, index) => (
                <Box key={service.service} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{service.service}</Typography>
                        <Typography variant="body2" fontWeight="medium">${service.cost.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        <Box 
                            sx={{ 
                                height: '100%', 
                                width: `${service.percentage}%`, 
                                backgroundColor: colors[index % colors.length],
                                borderRadius: '4px'
                            }} 
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default ServiceBreakdownWidget;