import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';

const TopAnomaliesWidget = ({ limit = 3 }) => {
    // Mock data - replace with API call in production
    const anomalies = [
        { id: 1, service: 'EC2', impact: '$120.50', date: '2025-03-01', severity: 'high' },
        { id: 2, service: 'S3', impact: '$87.30', date: '2025-02-28', severity: 'medium' },
        { id: 3, service: 'RDS', impact: '$65.40', date: '2025-02-27', severity: 'low' },
        { id: 4, service: 'Lambda', impact: '$45.20', date: '2025-02-26', severity: 'medium' }
    ].slice(0, limit);

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