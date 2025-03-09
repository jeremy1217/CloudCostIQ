import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { getMockOptimizationRecommendations } from '../services/mockData';

const TopOptimizationsWidget = ({ limit = 3 }) => {
    // Get optimization recommendations from centralized mock data service
    const allRecommendations = getMockOptimizationRecommendations();
    
    // Extract and format the necessary data
    const optimizations = allRecommendations.current_recommendations
        .slice(0, limit)
        .map(rec => ({
            id: rec.id || Math.random().toString(36).substring(2, 9),
            service: rec.service,
            savings: `$${rec.savings.toFixed(2)}`,
            description: rec.suggestion,
            priority: rec.savings > 200 ? 'high' : 
                      rec.savings > 100 ? 'medium' : 'low'
        }));

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