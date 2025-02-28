import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress, Paper } from "@mui/material";
import { Bar, Line } from "react-chartjs-2";

const CostBreakdown = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/insights/cost-breakdown")
            .then(response => {
                setData(response.data);
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

    if (!data) {
        return <Container><Typography>No cost data available.</Typography></Container>;
    }

    const { cost_by_provider, cost_by_service, cost_trends, ai_insights } = data;

    // Chart Data
    const providerChartData = {
        labels: Object.keys(cost_by_provider),
        datasets: [{
            label: "Cost by Provider ($)",
            data: Object.values(cost_by_provider),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        }]
    };

    const serviceChartData = {
        labels: Object.keys(cost_by_service),
        datasets: [{
            label: "Cost by Service ($)",
            data: Object.values(cost_by_service),
            backgroundColor: ["#4CAF50", "#FFA726", "#42A5F5"],
        }]
    };

    const trendsChartData = {
        labels: cost_trends.map(entry => entry.date),
        datasets: [{
            label: "Total Cost Over Time",
            data: cost_trends.map(entry => entry.total_cost),
            borderColor: "#42A5F5",
            fill: false,
            tension: 0.1
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

            {/* Cost Trends Over Time */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Cost Trends Over Time</Typography>
                <Line data={trendsChartData} />
            </Paper>

            {/* AI Insights */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">AI-Generated Insights 🔥</Typography>
                {ai_insights.map((insight, index) => (
                    <Typography key={index} sx={{ marginBottom: 1 }}>
                        <b>{insight.provider}:</b> {insight.suggestion} (<i>{insight.savings} savings</i>)
                    </Typography>
                ))}
            </Paper>
        </Container>
    );
};

export default CostBreakdown;
