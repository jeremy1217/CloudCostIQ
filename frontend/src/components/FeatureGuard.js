import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Tooltip,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FeatureGuard = ({
    feature,
    minPlanLevel,
    requiredLevel = 'basic',
    children,
    showUpgradeButton = true,
    fallback,
    tooltipMessage
}) => {
    const [hasAccess, setHasAccess] = useState(false);
    const [featureLevel, setFeatureLevel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, currentPlan } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                setLoading(true);
                
                // Check if user is authenticated
                if (!user || !currentPlan) {
                    setHasAccess(false);
                    setError('Please log in to access this feature');
                    return;
                }

                // Check plan level if specified
                if (minPlanLevel) {
                    const planLevels = {
                        'standard': 1,
                        'professional': 2,
                        'enterprise': 3
                    };
                    
                    const userPlanLevel = planLevels[currentPlan.name.toLowerCase()] || 0;
                    const requiredPlanLevel = planLevels[minPlanLevel.toLowerCase()] || 0;
                    
                    if (userPlanLevel < requiredPlanLevel) {
                        setHasAccess(false);
                        setError(`This feature requires ${minPlanLevel} plan or higher`);
                        return;
                    }
                }

                // Check feature access if specified
                if (feature) {
                    const features = currentPlan.features || {};
                    const featureAccess = features[feature];
                    
                    if (!featureAccess) {
                        setHasAccess(false);
                        setError(`Your plan does not include access to ${feature}`);
                        return;
                    }

                    // Check feature level
                    const levels = {
                        'readonly': 1,
                        'basic': 2,
                        'advanced': 3,
                        'full': 4
                    };

                    const userFeatureLevel = levels[featureAccess] || 0;
                    const requiredFeatureLevel = levels[requiredLevel] || 0;

                    if (userFeatureLevel < requiredFeatureLevel) {
                        setHasAccess(false);
                        setError(`This feature requires ${requiredLevel} access level`);
                        return;
                    }

                    setFeatureLevel(featureAccess);
                }

                setHasAccess(true);
                setError(null);
            } catch (err) {
                setError('Error checking feature access');
                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [user, currentPlan, feature, minPlanLevel, requiredLevel]);

    const handleUpgrade = () => {
        navigate('/pricing');
    };

    if (loading) {
        return <CircularProgress size={20} />;
    }

    if (!hasAccess) {
        if (fallback) {
            return fallback;
        }

        return (
            <Box sx={{ p: 2 }}>
                <Alert 
                    severity="info"
                    action={
                        showUpgradeButton && (
                            <Button
                                color="primary"
                                size="small"
                                onClick={handleUpgrade}
                            >
                                Upgrade Plan
                            </Button>
                        )
                    }
                >
                    {error || 'You do not have access to this feature'}
                </Alert>
            </Box>
        );
    }

    if (tooltipMessage && featureLevel) {
        return (
            <Tooltip 
                title={`${tooltipMessage} (Current access level: ${featureLevel})`}
                arrow
            >
                <Box>{children}</Box>
            </Tooltip>
        );
    }

    return children;
};

export default FeatureGuard; 