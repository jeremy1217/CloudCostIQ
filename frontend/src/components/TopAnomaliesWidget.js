import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { getMockAnomalyData } from '../services/mockData';

const TopAnomaliesWidget = ({ limit = 3 }) => {
    // Get anomalies from centralized mock data service instead of hardcoding here
    const allAnomalies = getMockAnomalyData();
    
    // Sort by timestamp (newest first) and limit to requested number
    const anomalies = allAnomalies
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
        .map(anomaly => ({
            id: anomaly.id,
            service: anomaly.service,
            impact: `$${(anomaly.anomalyCost - anomaly.baseCost).toFixed(2)}`,
            date: anomaly.timestamp.split('T')[0],
            severity: anomaly.deviation > 200 ? 'high' : 
                     anomaly.deviation > 100 ? 'medium' : 'low'
        }));

    // Function to determine severity color
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return { color: '#d32f2f', bgColor: '#ffebee' };
            case 'medium': return { color: '#ed6c02', bgColor: '#fff4e5' };
            default: return { color: '#2e7d32', bgColor: '#e8f5e9' };
        }
    };

    if (anomalies.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="textSecondary">No anomalies detected</Typography>
            </Box>
        );
    }

    return (
        <List sx={{ width: '100%' }}>
            {anomalies.map(anomaly => {
                const severityColor = getSeverityColor(anomaly.severity);
                
                return (
                    <ListItem 
                        key={anomaly.id}
                        divider
                        secondaryAction={
                            <Chip
                                label={anomaly.impact}
                                size="small"
                                sx={{ 
                                    backgroundColor: severityColor.bgColor,
                                    color: severityColor.color,
                                    fontWeight: 'bold'
                                }}
                            />
                        }
                    >
                        <ListItemText 
                            primary={`${anomaly.service} Usage Spike`}
                            secondary={`Detected on ${anomaly.date}`}
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

export default TopAnomaliesWidget;