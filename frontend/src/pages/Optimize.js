import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell, Button } from "@mui/material";

const Optimize = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Add this state to track applied recommendations
    const [appliedRecommendations, setAppliedRecommendations] = useState([]);

    // Add this function to fetch recommendations
    const fetchRecommendations = () => {
        setLoading(true);
        axios.get("http://localhost:8000/optimize/recommendations")
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching optimization recommendations:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRecommendations();
        // Or use mock data for testing:
        /*
        const mockData = {
            current_recommendations: [
                {provider: "AWS", service: "EC2", suggestion: "Use Reserved Instances", command: "aws ec2 modify-instance-attribute..."},
                {provider: "Azure", service: "VM", suggestion: "Use Azure Hybrid Benefit", command: "az vm update..."}
            ],
            past_recommendations: [
                {provider: "GCP", service: "Storage", suggestion: "Archive cold data", applied: "Applied"}
            ]
        };
        setData(mockData);
        setLoading(false);
        */
    }, []);

    // Add this function to handle optimization application
    const handleApplyOptimization = (recommendation) => {
        axios.post("http://localhost:8000/optimize/apply", { 
            provider: recommendation.provider,
            service: recommendation.service
        })
        .then(() => {
            // Add to applied recommendations list
            setAppliedRecommendations([...appliedRecommendations, 
                `${recommendation.provider}-${recommendation.service}`]);
            
            // Refresh data to get updated status
            fetchRecommendations();
        })
        .catch(err => {
            console.error(err);
            alert("Error applying optimization");
        });
    };

    // Add this function to check if a recommendation is applied
    const isApplied = (rec) => {
        return appliedRecommendations.includes(`${rec.provider}-${rec.service}`);
    };

    if (loading) {
        return <Container><Typography>Loading optimization recommendations...</Typography><CircularProgress /></Container>;
    }

    if (!data) {
        return <Container><Typography>No recommendations available.</Typography></Container>;
    }

    return (
        <Container>
            <Typography variant="h4" align="center" sx={{ marginBottom: 3 }}>
                AI-Driven Cost Optimization 💰
            </Typography>

            {/* AI-Generated Recommendations */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">AI-Generated Recommendations ⚡</Typography>
                {data.current_recommendations.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Provider</b></TableCell>
                                <TableCell><b>Service</b></TableCell>
                                <TableCell><b>Recommendation</b></TableCell>
                                <TableCell><b>Command</b></TableCell>
                                <TableCell><b>Action</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.current_recommendations.map((rec, index) => (
                                <TableRow key={index}>
                                    <TableCell>{rec.provider}</TableCell>
                                    <TableCell>{rec.service}</TableCell>
                                    <TableCell>{rec.suggestion}</TableCell>
                                    <TableCell>
                                        <code>{rec.command}</code>
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="contained" 
                                            color={isApplied(rec) ? "success" : "primary"}
                                            onClick={() => handleApplyOptimization(rec)}
                                            disabled={rec.command === "N/A" || isApplied(rec)}>
                                            {isApplied(rec) ? "Applied" : "Apply"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <Typography>No new recommendations available.</Typography>}
            </Paper>

            {/* Past Recommendations */}
            <Paper sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h6">Past Recommendations 🕒</Typography>
                {data.past_recommendations.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Provider</b></TableCell>
                                <TableCell><b>Service</b></TableCell>
                                <TableCell><b>Recommendation</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.past_recommendations.map((rec, index) => (
                                <TableRow key={index}>
                                    <TableCell>{rec.provider}</TableCell>
                                    <TableCell>{rec.service}</TableCell>
                                    <TableCell>{rec.suggestion}</TableCell>
                                    <TableCell>{rec.applied}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : <Typography>No past recommendations available.</Typography>}
            </Paper>
        </Container>
    );
};

export default Optimize;