import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import planService from '../services/planService';

const FeatureGuard = ({ 
    feature, 
    minPlanLevel, 
    children, 
    fallback = null,
    showUpgradeButton = true 
}) => {
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const plan = await planService.getCurrentPlan();
                setCurrentPlan(plan);
                
                if (!plan) {
                    setHasAccess(false);
                    return;
                }

                // Check feature access if feature name is provided
                if (feature) {
                    const featureAccess = await planService.checkFeatureAccess(feature);
                    setHasAccess(featureAccess);
                    return;
                }

                // Check plan level if minPlanLevel is provided
                if (minPlanLevel) {
                    const planLevels = {
                        'standard': 1,
                        'professional': 2,
                        'enterprise': 3
                    };
                    
                    const requiredLevel = planLevels[minPlanLevel.toLowerCase()];
                    const userLevel = planLevels[plan.plan_name.toLowerCase()];
                    
                    setHasAccess(userLevel >= requiredLevel);
                    return;
                }

                setHasAccess(false);
            } catch (error) {
                console.error('Error checking feature access:', error);
                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [feature, minPlanLevel]);

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!hasAccess) {
        if (fallback) {
            return fallback;
        }

        return (
            <Box 
                sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    bgcolor: 'grey.50'
                }}
            >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Feature Not Available
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    This feature requires {minPlanLevel || 'a higher'} plan or above.
                    {currentPlan && ` You are currently on the ${currentPlan.plan_name} plan.`}
                </Typography>
                {showUpgradeButton && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => window.location.href = '/app/settings/subscription'}
                    >
                        Upgrade Plan
                    </Button>
                )}
            </Box>
        );
    }

    return children;
};

export default FeatureGuard; 