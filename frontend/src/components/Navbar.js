import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    CloudCostIQ
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button color="inherit" component={Link} to="/">Dashboard</Button>
                    <Button color="inherit" component={Link} to="/insights">Insights</Button>
                    <Button color="inherit" component={Link} to="/optimize">Optimize</Button>
                    <Button color="inherit" component={Link} to="/costs">Cost Table</Button>
                    <Button color="inherit" component={Link} to="/cost-breakdown">Cost Breakdown</Button>
                    {/* Add new button for Enhanced AI Dashboard with a special highlight */}
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/ai-dashboard"
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