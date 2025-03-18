import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingIndicator from "./components/LoadingIndicator";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ConnectionHealthPage from './pages/admin/ConnectionHealthPage';
import theme from './theme';
import { bypassAuthForDevelopment } from './utils/devAuth';
import queryClient from './services/queryClient';

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import Marketing from "./pages/Marketing";

// Lazy load pages with preloading
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CostsByService = lazy(() => import("./pages/costs/CostsByService"));
const CostsByProvider = lazy(() => import("./pages/costs/CostsByProvider"));
const CostAttribution = lazy(() => import("./pages/costs/CostAttribution"));
const Insights = lazy(() => import("./pages/Insights"));
const Optimize = lazy(() => import("./pages/Optimize"));
const EnhancedAIDashboard = lazy(() => import("./pages/EnhancedAIDashboard"));
const MultiCloudComparisonPage = lazy(() => import("./pages/MultiCloudComparisonPage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const ApiKeyManagement = lazy(() => import("./pages/ApiKeyManagement"));
const DataVisualizationDemo = lazy(() => import("./pages/DataVisualizationDemo"));

const DRAWER_WIDTH = 280;

// Preload components when user hovers over navigation items
const preloadComponent = (component) => {
  const preload = () => {
    component.preload();
  };
  return preload;
};

function App() {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        // Set up development authentication
        bypassAuthForDevelopment();
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ErrorBoundary>
                    <AuthProvider>
                        <Router>
                            <Box sx={{ display: 'flex' }}>
                                <Navbar
                                    drawerWidth={DRAWER_WIDTH}
                                    onDrawerToggle={handleDrawerToggle}
                                />
                                <Sidebar
                                    drawerWidth={DRAWER_WIDTH}
                                    mobileOpen={mobileOpen}
                                    onDrawerToggle={handleDrawerToggle}
                                    onNavItemHover={{
                                        dashboard: preloadComponent(Dashboard),
                                        costsByService: preloadComponent(CostsByService),
                                        costsByProvider: preloadComponent(CostsByProvider),
                                        costAttribution: preloadComponent(CostAttribution),
                                        insights: preloadComponent(Insights),
                                        optimize: preloadComponent(Optimize),
                                        enhancedAI: preloadComponent(EnhancedAIDashboard),
                                        multiCloud: preloadComponent(MultiCloudComparisonPage),
                                        userProfile: preloadComponent(UserProfile),
                                        apiKeys: preloadComponent(ApiKeyManagement),
                                        dataViz: preloadComponent(DataVisualizationDemo),
                                    }}
                                />
                                <Box
                                    component="main"
                                    sx={{
                                        flexGrow: 1,
                                        p: 3,
                                        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                                        ml: { sm: `${DRAWER_WIDTH}px` },
                                    }}
                                >
                                    <Suspense fallback={<LoadingIndicator />}>
                                        <Routes>
                                            <Route path="/" element={<Marketing />} />
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/register" element={<Register />} />
                                            <Route path="/unauthorized" element={<Unauthorized />} />
                                            <Route
                                                path="/dashboard"
                                                element={
                                                    <ProtectedRoute>
                                                        <Dashboard />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            {/* Add other routes similarly */}
                                        </Routes>
                                    </Suspense>
                                </Box>
                            </Box>
                        </Router>
                    </AuthProvider>
                </ErrorBoundary>
                {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
            </ThemeProvider>
        </QueryClientProvider>
    );
}

// Admin routes component
const AdminRoutes = () => {
    const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboardPage"));
    const UserManagement = lazy(() => import("./pages/admin/AdminUsersPage"));
    const CloudConnections = lazy(() => import("./pages/admin/CloudConnections"));
    
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/cloud-connections" element={<CloudConnections />} />
            <Route path="*" element={<Navigate to="/app/admin" replace />} />
        </Routes>
    );
};

export default App;