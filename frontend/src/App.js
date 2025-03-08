import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingIndicator from "./components/LoadingIndicator";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

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

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <Navbar />
                    <div style={{ padding: '20px' }}>
                        <Suspense fallback={<LoadingIndicator message="Loading page..." />}>
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/unauthorized" element={<Unauthorized />} />
                                
                                {/* Protected routes - regular users */}
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

                                {/* Fallback route */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

// Admin routes component
const AdminRoutes = () => {
    const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
    const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
    
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};

export default App;