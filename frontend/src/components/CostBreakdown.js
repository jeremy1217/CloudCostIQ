import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Box, Button } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { getCostBreakdown } from "../services/api";
import LoadingIndicator from "./LoadingIndicator";

const CostBreakdown = () => {
    const [costData, setCostData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getCostBreakdown();
                setCostData(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching cost breakdown:", err);
                setError('Failed to load cost breakdown data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <LoadingIndicator message="Loading cost breakdown data..." />;
    }

    if (error) {
        return (
            <Container>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }} 
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!costData || costData.length === 0) {
        return (
            <Container>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>No cost data available.</Typography>
                </Box>
            </Container>
        );
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
            backgroundColor: ["#4CAF50", "#FFA726", "#42A5F5", "#9C27B0", "#607D8B"],
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

            {/* Total Cost Summary */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Cost Summary</Typography>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                        <strong>Total Cost:</strong> ${Object.values(providerCosts).reduce((sum, cost) => sum + cost, 0).toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body1">
                        <strong>Highest Service Cost:</strong> {
                            Object.entries(serviceCosts)
                                .sort((a, b) => b[1] - a[1])[0][0]
                        } (${
                            Math.max(...Object.values(serviceCosts)).toFixed(2)
                        })
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default CostBreakdown;