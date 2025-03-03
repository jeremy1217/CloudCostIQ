import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';

const TopOptimizationsWidget = ({ limit = 3 }) => {
    // Mock data - replace with API call in production
    const optimizations = [
        { id: 1, service: 'EC2', savings: '$145.30', description: 'Right-size underutilized instances', priority: 'high' },
        { id: 2, service: 'S3', savings: '$87.15', description: 'Use lifecycle policies for older objects', priority: 'medium' },
        { id: 3, service: 'RDS', savings: '$65.40', description: 'Delete unused snapshots', priority: 'low' },
        { id: 4, service: 'EC2', savings: '$55.20', description: 'Reserved Instance opportunity', priority: 'medium' }
    ].slice(0, limit);

    // Function to determine priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return { color: '#2e7d32', bgColor: '#e8f5e9' }; // Green for high savings
            case 'medium': return { color: '#ed6c02', bgColor: '#fff4e5' };
            default: return { color: '#0288d1', bgColor: '#e1f5fe' };
        }
    };

    if (optimizations.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="textSecondary">No optimization opportunities found</Typography>
            </Box>
        );
    }

    return (
        <List sx={{ width: '100%' }}>
            {optimizations.map(opt => {
                const priorityColor = getPriorityColor(opt.priority);
                
                return (
                    <ListItem 
                        key={opt.id}
                        divider
                        secondaryAction={
                            <Chip
                                label={opt.savings}
                                size="small"
                                sx={{ 
                                    backgroundColor: priorityColor.bgColor,
                                    color: priorityColor.color,
                                    fontWeight: 'bold'
                                }}
                            />
                        }
                    >
                        <ListItemText 
                            primary={opt.service}
                            secondary={opt.description}
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

export default TopOptimizationsWidget;