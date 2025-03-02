import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Optimize from "./pages/Optimize";
import CostTable from "./components/CostTable";
import CostBreakdown from "./components/CostBreakdown";
import EnhancedAIDashboard from "./pages/EnhancedAIDashboard"; // Import the new component
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Navbar />
                <div style={{ padding: '20px' }}>
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
                        {/* Add the new Enhanced AI Dashboard route */}
                        <Route path="/ai-dashboard" element={
                            <ErrorBoundary>
                                <EnhancedAIDashboard />
                            </ErrorBoundary>
                        } />
                    </Routes>
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;