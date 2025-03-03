// src/components/AiStatusCard.js
import React from 'react';
import { Box, Card, CardContent, Typography, Switch, FormControlLabel } from '@mui/material';

const AiStatusCard = (props) => {
    const [enhancedEnabled, setEnhancedEnabled] = React.useState(true);
    
    const handleEnhancedChange = (event) => {
        setEnhancedEnabled(event.target.checked);
        // In production, you would call your API here to toggle the setting
    };
    
    return (
        <Card {...props}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6">AI Engine Status</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {enhancedEnabled 
                                ? "Enhanced AI capabilities are enabled, providing deeper analysis and better recommendations."
                                : "Standard AI capabilities are active. Enable enhanced AI for more comprehensive insights."}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={enhancedEnabled}
                                onChange={handleEnhancedChange}
                                color="primary"
                            />
                        }
                        label="Enhanced AI"
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default AiStatusCard;