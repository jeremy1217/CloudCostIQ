import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress, Paper } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const CostBreakdown = () => {
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/insights/cost-breakdown")
            .then(response => {
                setCostData(response.data.cost_breakdown || []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching cost breakdown:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Container><Typography>Loading cost breakdown...</Typography><CircularProgress /></Container>;
    }

    if (!costData || costData.length === 0) {
        return <Container><Typography>No cost data available.</Typography></Container>;
    }

    // Process data for charts
    const providerCosts = {};
    const serviceCosts = {};
    
    costData.forEach(item => {
        // Aggregate by provider
        providerCosts[item.provider] = (providerCosts[item.provider] || 0) + item.cost;
        
        // Aggregate by service
        serviceCosts[item.service] = (serviceCosts[item.service] || 0) + item.cost;
    });
    
    // Format for charts
    const providerChartData = {
        labels: Object.keys(providerCosts),
        datasets: [{
            label: "Cost by Provider ($)",
            data: Object.values(providerCosts),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        }]
    };

    const serviceChartData = {
        labels: Object.keys(serviceCosts),
        datasets: [{
            label: "Cost by Service ($)",
            data: Object.values(serviceCosts),
            backgroundColor: ["#4CAF50", "#FFA726", "#42A5F5"],
        }]
    };

    return (
        <Container>
            <Typography variant="h4" align="center" sx={{ marginBottom: 3 }}>
                Cost Breakdown & AI Insights 💡
            </Typography>

            {/* Cost by Provider */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Cost by Provider</Typography>
                <Bar data={providerChartData} />
            </Paper>

            {/* Cost by Service */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Cost by Service</Typography>
                <Bar data={serviceChartData} />
            </Paper>
        </Container>
    );
};

export default CostBreakdown;