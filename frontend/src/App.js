import React, { Suspense, lazy, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingIndicator from "./components/LoadingIndicator";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ConnectionHealthPage from './pages/admin/ConnectionHealthPage';
import theme from './theme';

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import Marketing from "./pages/Marketing";

// Lazy load pages
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

function App() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
                <Router>
                    <AuthProvider>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Marketing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            
                            {/* Protected routes with layout */}
                            <Route path="/app/*" element={
                                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                                    <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
                                    <Box
                                        component="main"
                                        sx={{
                                            flexGrow: 1,
                                            p: 3,
                                            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                                            bgcolor: 'background.default',
                                            minHeight: '100vh',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Navbar onDrawerToggle={handleDrawerToggle} />
                                        <Box sx={{ flex: 1, py: 2 }}>
                                            <Suspense fallback={
                                                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                                                    <LoadingIndicator message="Loading page..." />
                                                </Box>
                                            }>
                                                <Routes>
                                                    <Route path="/" element={
                                                        <ProtectedRoute>
                                                            <Dashboard />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/insights" element={
                                                        <ProtectedRoute>
                                                            <Insights />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/optimize" element={
                                                        <ProtectedRoute>
                                                            <Optimize />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/ai-dashboard" element={
                                                        <ProtectedRoute>
                                                            <EnhancedAIDashboard />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/multi-cloud" element={
                                                        <ProtectedRoute>
                                                            <MultiCloudComparisonPage />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/profile" element={
                                                        <ProtectedRoute>
                                                            <UserProfile />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/api-keys" element={
                                                        <ProtectedRoute>
                                                            <ApiKeyManagement />
                                                        </ProtectedRoute>
                                                    } />

                                                    {/* Costs sub-routes */}
                                                    <Route path="/costs/by-service" element={
                                                        <ProtectedRoute>
                                                            <CostsByService />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/costs/by-provider" element={
                                                        <ProtectedRoute>
                                                            <CostsByProvider />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/costs/attribution" element={
                                                        <ProtectedRoute>
                                                            <CostAttribution />
                                                        </ProtectedRoute>
                                                    } />

                                                    {/* Admin routes */}
                                                    <Route path="/admin/*" element={
                                                        <ProtectedRoute roles={["admin"]}>
                                                            <AdminRoutes />
                                                        </ProtectedRoute>
                                                    } />
                                                    <Route path="/admin/connection-health" element={
                                                        <ProtectedRoute requiredRole="admin">
                                                            <ConnectionHealthPage />
                                                        </ProtectedRoute>
                                                    } />

                                                    {/* Demo routes */}
                                                    <Route path="/demo/data-viz" element={
                                                        <ProtectedRoute>
                                                            <DataVisualizationDemo />
                                                        </ProtectedRoute>
                                                    } />
                                                </Routes>
                                            </Suspense>
                                        </Box>
                                    </Box>
                                </Box>
                            } />

                            {/* Fallback route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </Router>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

// Admin routes component
const AdminRoutes = () => {
    const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
    const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
    const CloudConnections = lazy(() => import("./pages/admin/CloudConnections"));
    
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/cloud-connections" element={<CloudConnections />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};

export default App;