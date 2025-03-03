import React, { Suspense, lazy } from "react"; // Add Suspense and lazy imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingIndicator from "./components/LoadingIndicator"; // Import LoadingIndicator

// Replace direct imports with lazy imports
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Insights = lazy(() => import("./pages/Insights"));
const Optimize = lazy(() => import("./pages/Optimize"));
const CostTable = lazy(() => import("./components/CostTable"));
const CostBreakdown = lazy(() => import("./components/CostBreakdown"));
const EnhancedAIDashboard = lazy(() => import("./pages/EnhancedAIDashboard"));

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Navbar />
                <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LoadingIndicator message="Loading page..." />}>
                        <Routes>
                            <Route path="/" element={
                                <ErrorBoundary>
                                    <Dashboard />
                                </ErrorBoundary>
                            } />
                            <Route path="/insights" element={
                                <ErrorBoundary>
                                    <Insights />
                                </ErrorBoundary>
                            } />
                            <Route path="/optimize" element={
                                <ErrorBoundary>
                                    <Optimize />
                                </ErrorBoundary>
                            } />
                            <Route path="/costs" element={
                                <ErrorBoundary>
                                    <CostTable />
                                </ErrorBoundary>
                            } />
                            <Route path="/cost-breakdown" element={
                                <ErrorBoundary>
                                    <CostBreakdown />
                                </ErrorBoundary>
                            } />
                            <Route path="/ai-dashboard" element={
                                <ErrorBoundary>
                                    <EnhancedAIDashboard />
                                </ErrorBoundary>
                            } />
                        </Routes>
                    </Suspense>
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;