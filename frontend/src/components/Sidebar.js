import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 72;

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    costs: true,
    admin: true
  });

  const isAdmin = user?.roles?.includes('admin');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (menuId) => {
    if (!collapsed) {
      setOpenMenus(prev => ({
        ...prev,
        [menuId]: !prev[menuId]
      }));
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      type: 'item',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      type: 'group',
      id: 'costs',
      title: 'Cost Management',
      icon: <StorageIcon />,
      items: [
        { title: 'By Service', path: '/costs/by-service', icon: <CloudIcon /> },
        { title: 'By Provider', path: '/costs/by-provider', icon: <CompareArrowsIcon /> },
        { title: 'Attribution', path: '/costs/attribution', icon: <TrendingUpIcon /> },
      ],
    },
    {
      type: 'item',
      title: 'Insights',
      icon: <InsightsIcon />,
      path: '/insights',
    },
    {
      type: 'item',
      title: 'Optimize',
      icon: <TrendingUpIcon />,
      path: '/optimize',
    },
    {
      type: 'item',
      title: 'AI Dashboard',
      icon: <SmartToyIcon />,
      path: '/ai-dashboard',
    },
    {
      type: 'item',
      title: 'Multi-Cloud',
      icon: <CompareArrowsIcon />,
      path: '/multi-cloud',
    },
  ];

  if (isAdmin) {
    navigationItems.push({
      type: 'group',
      id: 'admin',
      title: 'Administration',
      icon: <AdminPanelSettingsIcon />,
      items: [
        { title: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
        { title: 'Users', path: '/admin/users', icon: <GroupIcon /> },
        { title: 'Cloud Connections', path: '/admin/cloud-connections', icon: <CloudIcon /> },
        { title: 'Connection Health', path: '/admin/connection-health', icon: <MonitorHeartIcon /> },
      ],
    });
  }

  const renderNavItem = (item, depth = 0) => {
    if (item.type === 'group') {
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => handleMenuClick(item.id)}
              sx={{
                minHeight: 48,
                px: 2.5,
                py: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText primary={item.title} />
                  {openMenus[item.id] ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </ListItem>
          <Collapse in={!collapsed && openMenus[item.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.items.map((subItem) => (
                <ListItemButton
                  key={subItem.path}
                  onClick={() => handleNavigate(subItem.path)}
                  selected={isActive(subItem.path)}
                  sx={{
                    minHeight: 48,
                    pl: collapsed ? 2.5 : 4,
                    py: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>
                    {subItem.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={subItem.title} />}
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          onClick={() => handleNavigate(item.path)}
          selected={isActive(item.path)}
          sx={{
            minHeight: 48,
            px: 2.5,
            py: 1,
            '&.Mui-selected': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
              },
            },
          }}
        >
          <Tooltip title={collapsed ? item.title : ''} placement="right">
            <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>
              {item.icon}
            </ListItemIcon>
          </Tooltip>
          {!collapsed && <ListItemText primary={item.title} />}
        </ListItemButton>
      </ListItem>
    );
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <Typography variant="h6" noWrap component="div">
            CloudCostIQ
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navigationItems.map((item) => renderNavItem(item))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH },
        flexShrink: { md: 0 }
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            bgcolor: 'background.paper',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 