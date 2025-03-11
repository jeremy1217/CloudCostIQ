import React, { useState } from "react";
import { 
    AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, 
    IconButton, Avatar, Divider, ListItemIcon, Tooltip, Badge, useTheme, alpha
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudIcon from '@mui/icons-material/Cloud';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onDrawerToggle }) => {
    const theme = useTheme();
    const [costsAnchorEl, setCostsAnchorEl] = useState(null);
    const [userAnchorEl, setUserAnchorEl] = useState(null);
    const [notificationsAnchor, setNotificationsAnchor] = useState(null);
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
    
    const handleLogout = async () => {
        await logout();
        setUserAnchorEl(null);
        navigate('/login');
    };
    
    const handleNavigate = (path) => {
        navigate(path);
        setUserAnchorEl(null);
    };
    
    const isAdmin = user?.roles?.includes('admin');

    const handleNotificationsMenu = (event) => {
        setNotificationsAnchor(event.currentTarget);
    };

    const handleCloseNotifications = () => {
        setNotificationsAnchor(null);
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onDrawerToggle}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

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
                        
                        {/* Quick Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Notifications */}
                            <Tooltip title="Notifications">
                                <IconButton
                                    size="large"
                                    aria-label="show notifications"
                                    color="inherit"
                                    onClick={handleNotificationsMenu}
                                >
                                    <Badge badgeContent={3} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            {/* Settings */}
                            <Tooltip title="Settings">
                                <IconButton
                                    size="large"
                                    aria-label="settings"
                                    color="inherit"
                                    onClick={() => navigate('/settings')}
                                >
                                    <SettingsIcon />
                                </IconButton>
                            </Tooltip>

                            {/* User Menu */}
                            <Tooltip title="Account settings">
                                <IconButton
                                    size="large"
                                    aria-label="account"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleUserMenuClick}
                                    color="inherit"
                                >
                                    {user?.avatar ? (
                                        <Avatar
                                            alt={user.name}
                                            src={user.avatar}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                    ) : (
                                        <AccountCircleIcon />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
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

            {/* User Menu Dropdown */}
            <Menu
                id="menu-appbar"
                anchorEl={userAnchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(userAnchorEl)}
                onClose={handleUserMenuClose}
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: 'background.paper',
                        boxShadow: theme.shadows[3],
                        minWidth: 200,
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Signed in as
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                        {user?.email}
                    </Typography>
                </Box>
                <MenuItem onClick={() => handleNavigate('/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => handleNavigate('/api-keys')}>API Keys</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notificationsAnchor}
                open={Boolean(notificationsAnchor)}
                onClose={handleCloseNotifications}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: 'background.paper',
                        boxShadow: theme.shadows[3],
                        minWidth: 320,
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Notifications
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <MenuItem onClick={handleCloseNotifications}>
                            <Box>
                                <Typography variant="body2">
                                    Cost anomaly detected in EC2 instances
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    2 minutes ago
                                </Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem onClick={handleCloseNotifications}>
                            <Box>
                                <Typography variant="body2">
                                    New optimization recommendations available
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    1 hour ago
                                </Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem onClick={handleCloseNotifications}>
                            <Box>
                                <Typography variant="body2">
                                    Monthly cost report is ready
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    1 day ago
                                </Typography>
                            </Box>
                        </MenuItem>
                    </Box>
                </Box>
            </Menu>
        </AppBar>
    );
};

export default Navbar;