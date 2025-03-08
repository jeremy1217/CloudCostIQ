import React, { useState } from "react";
import { 
    AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, 
    IconButton, Avatar, Divider, ListItemIcon
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const [costsAnchorEl, setCostsAnchorEl] = useState(null);
    const [userAnchorEl, setUserAnchorEl] = useState(null);
    const openCostsMenu = Boolean(costsAnchorEl);
    const openUserMenu = Boolean(userAnchorEl);
    
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleCostsMenuClick = (event) => {
        setCostsAnchorEl(event.currentTarget);
    };

    const handleCostsMenuClose = () => {
        setCostsAnchorEl(null);
    };
    
    const handleUserMenuClick = (event) => {
        setUserAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserAnchorEl(null);
    };
    
    const handleLogout = () => {
        logout();
        setUserAnchorEl(null);
    };
    
    const handleNavigate = (path) => {
        navigate(path);
        setUserAnchorEl(null);
    };
    
    const isAdmin = user?.roles?.includes('admin');

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    CloudCostIQ
                </Typography>
                
                {isAuthenticated ? (
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
                            to="/multi-cloud"
                        >
                            Multi-Cloud
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
                        
                        {/* User Menu */}
                        <IconButton 
                            color="inherit" 
                            onClick={handleUserMenuClick}
                            sx={{ ml: 1 }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {user?.username?.[0]?.toUpperCase() || "U"}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={userAnchorEl}
                            open={openUserMenu}
                            onClose={handleUserMenuClose}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2">
                                    Signed in as <b>{user?.username}</b>
                                </Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => handleNavigate('/profile')}>
                                <ListItemIcon>
                                    <AccountCircleIcon fontSize="small" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={() => handleNavigate('/api-keys')}>
                                <ListItemIcon>
                                    <VpnKeyIcon fontSize="small" />
                                </ListItemIcon>
                                API Keys
                            </MenuItem>
                            {isAdmin && (
                                <MenuItem onClick={() => handleNavigate('/admin')}>
                                    <ListItemIcon>
                                        <AdminPanelSettingsIcon fontSize="small" />
                                    </ListItemIcon>
                                    Admin Panel
                                </MenuItem>
                            )}
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <ExitToAppIcon fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/login"
                        >
                            Login
                        </Button>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/register"
                            variant="outlined"
                            sx={{ 
                                borderColor: 'white',
                                '&:hover': { borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;