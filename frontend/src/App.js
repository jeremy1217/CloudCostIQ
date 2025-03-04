import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingIndicator from "./components/LoadingIndicator";
import MultiCloudComparisonPage from './pages/MultiCloudComparisonPage';

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CostsByService = lazy(() => import("./pages/costs/CostsByService"));
const CostsByProvider = lazy(() => import("./pages/costs/CostsByProvider"));
const CostAttribution = lazy(() => import("./pages/costs/CostAttribution"));
const Insights = lazy(() => import("./pages/Insights"));
const Optimize = lazy(() => import("./pages/Optimize"));
const EnhancedAIDashboard = lazy(() => import("./pages/EnhancedAIDashboard"));


function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Navbar />
                <div style={{ padding: '20px' }}>
                    <Suspense fallback={<LoadingIndicator message="Loading page..." />}>
                        <Routes>
                            {/* Main routes */}
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/insights" element={<Insights />} />
                            <Route path="/optimize" element={<Optimize />} />
                            <Route path="/ai-dashboard" element={<EnhancedAIDashboard />} />
                            <Route path="/multi-cloud" element={<MultiCloudComparisonPage />} />

                            {/* Costs sub-routes */}
                            <Route path="/costs/by-service" element={<CostsByService />} />
                            <Route path="/costs/by-provider" element={<CostsByProvider />} />
                            <Route path="/costs/attribution" element={<CostAttribution />} />
                        </Routes>
                    </Suspense>
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;