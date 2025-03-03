import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';  // Add this import

const Navbar = () => {
    const [costsAnchorEl, setCostsAnchorEl] = useState(null);
    const openCostsMenu = Boolean(costsAnchorEl);

    const handleCostsMenuClick = (event) => {
        setCostsAnchorEl(event.currentTarget);
    };

    const handleCostsMenuClose = () => {
        setCostsAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    CloudCostIQ
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Primary Navigation */}
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/"
                    >
                        Dashboard
                    </Button>
                    
                    {/* Costs Dropdown */}
                    <Button 
                        color="inherit"
                        onClick={handleCostsMenuClick}
                        endIcon={<ExpandMoreIcon />}
                    >
                        Costs
                    </Button>
                    <Menu
                        anchorEl={costsAnchorEl}
                        open={openCostsMenu}
                        onClose={handleCostsMenuClose}
                    >
                        <MenuItem 
                            component={Link} 
                            to="/costs/by-service" 
                            onClick={handleCostsMenuClose}
                        >
                            By Service
                        </MenuItem>
                        <MenuItem 
                            component={Link} 
                            to="/costs/by-provider" 
                            onClick={handleCostsMenuClose}
                        >
                            By Provider
                        </MenuItem>
                        <MenuItem 
                            component={Link} 
                            to="/costs/attribution" 
                            onClick={handleCostsMenuClose}
                        >
                            Cost Attribution
                        </MenuItem>
                    </Menu>
                    
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/insights"
                    >
                        Insights
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/optimize"
                    >
                        Optimize
                    </Button>
                    <Button 
                        color="inherit" 
                        component={Link} 
                        to="/ai-dashboard"
                        sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.15)', 
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
                        }}
                    >
                        Advanced AI
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;