import React, { useCallback } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
    // Add prefetch functions
    const prefetchDashboard = useCallback(() => {
        import("../pages/Dashboard");
    }, []);
    
    const prefetchInsights = useCallback(() => {
        import("../pages/Insights");
    }, []);
    
    const prefetchOptimize = useCallback(() => {
        import("../pages/Optimize");
    }, []);
    
    const prefetchCostTable = useCallback(() => {
        import("../components/CostTable");
    }, []);
    
    const prefetchCostBreakdown = useCallback(() => {
        import("../components/CostBreakdown");
    }, []);
    
    const prefetchAIDashboard = useCallback(() => {
        import("../pages/EnhancedAIDashboard");
    }, []);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    CloudCostIQ
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/"
                        onMouseEnter={prefetchDashboard}
                    >
                        Dashboard
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/insights"
                        onMouseEnter={prefetchInsights}
                    >
                        Insights
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/optimize"
                        onMouseEnter={prefetchOptimize}
                    >
                        Optimize
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/costs"
                        onMouseEnter={prefetchCostTable}
                    >
                        Cost Table
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/cost-breakdown"
                        onMouseEnter={prefetchCostBreakdown}
                    >
                        Cost Breakdown
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/ai-dashboard"
                        onMouseEnter={prefetchAIDashboard}
                        sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.15)', 
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
                        }}
                    >
                        AI Dashboard
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;