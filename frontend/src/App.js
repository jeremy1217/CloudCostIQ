// In frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Optimize from "./pages/Optimize";
import CostTable from "./components/CostTable";
import CostBreakdown from "./components/CostBreakdown";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/optimize" element={<Optimize />} />
                <Route path="/costs" element={<CostTable />} />
                <Route path="/cost-breakdown" element={<CostBreakdown />} />
            </Routes>
        </Router>
    );
}

export default App; // Add this line - it's crucial!