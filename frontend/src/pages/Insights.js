import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Insights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/insights/mock-insights")
            .then(response => {
                setInsights(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching insights:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Container><Typography>Loading insights...</Typography><CircularProgress /></Container>;
    }

    if (!insights) {
        return <Container><Typography>No insights available.</Typography></Container>;
    }

    const { cost_trends, anomalies } = insights;

    const chartData = {
        labels: cost_trends.map(entry => entry.date),
        datasets: [
            {
                label: "Actual Costs ($)",
                data: cost_trends.map(entry => entry.cost),
                fill: false,
                borderColor: "#4CAF50",
                tension: 0.1
            }
        ]
    };

    return (
        <Container>
            <Typography variant="h4" align="center" sx={{ marginBottom: 3 }}>
                Cloud Cost Insights 📊
            </Typography>

            {/* Cost Trends Chart */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Cost Trends</Typography>
                <Line data={chartData} />
            </Paper>

            {/* Anomalies Table with Root Cause */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Anomalies ⚠️</Typography>
                {anomalies.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Date</b></TableCell>
                                <TableCell><b>Service</b></TableCell>
                                <TableCell><b>Cost ($)</b></TableCell>
                                <TableCell><b>Root Cause Analysis</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {anomalies.map((anomaly, index) => (
                                <TableRow key={index} sx={{ backgroundColor: "#FFCDD2" }}>
                                    <TableCell>{anomaly.date}</TableCell>
                                    <TableCell>{anomaly.service}</TableCell>
                                    <TableCell>${anomaly.cost.toFixed(2)}</TableCell>
                                    <TableCell>{anomaly.root_cause}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <Typography>No anomalies detected.</Typography>}
            </Paper>
        </Container>
    );
};

export default Insights;
