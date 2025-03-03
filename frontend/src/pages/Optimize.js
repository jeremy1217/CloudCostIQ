// frontend/src/pages/Optimize.js
import React from "react";
import { Container, Typography, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell, Button, Box } from "@mui/material";
import { useOptimizationRecommendations, useApplyOptimization } from "../hooks/useApi";

const Optimize = () => {
    const { data, isLoading, isError, error } = useOptimizationRecommendations();
    const applyOptimization = useApplyOptimization();

    // Handle optimization application
    const handleApplyOptimization = (recommendation) => {
        applyOptimization.mutate({ 
            provider: recommendation.provider,
            service: recommendation.service
        });
    };

    // Check if a recommendation is being applied or has been applied
    const isApplied = (rec) => {
        return applyOptimization.isPending && 
               applyOptimization.variables?.provider === rec.provider && 
               applyOptimization.variables?.service === rec.service;
    };

    if (isLoading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading optimization recommendations...</Typography>
                </Box>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error?.message || 'Error loading recommendations'}</Typography>
                </Box>
            </Container>
        );
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
                {data.current_recommendations?.length > 0 ? (
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
                                            color={rec.applied ? "success" : "primary"}
                                            onClick={() => handleApplyOptimization(rec)}
                                            disabled={rec.command === "N/A" || rec.applied || isApplied(rec)}>
                                            {isApplied(rec) ? "Applying..." : rec.applied ? "Applied" : "Apply"}
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
                {data.past_recommendations?.length > 0 ? (
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
                                    <TableCell>{rec.applied ? "Applied" : "Pending"}</TableCell>
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