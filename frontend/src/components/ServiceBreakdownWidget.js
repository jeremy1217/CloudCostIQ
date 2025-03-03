import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const ServiceBreakdownWidget = ({ limit = 5 }) => {
    // Mock data - replace with API call in production
    const services = [
        { service: 'EC2', cost: 4587.23, percentage: 36.7 },
        { service: 'S3', cost: 2145.67, percentage: 17.2 },
        { service: 'RDS', cost: 3256.78, percentage: 26.1 },
        { service: 'Lambda', cost: 1234.56, percentage: 9.9 },
        { service: 'Other', cost: 1274.43, percentage: 10.1 }
    ].slice(0, limit);

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