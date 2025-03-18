import React, { useState, useEffect } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography, CircularProgress, Box, Button } from "@mui/material";
import api from "../services/api";

const CostTable = () => {
    const [costs, setCosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCosts = async () => {
        setIsLoading(true);
        try {
            const response = await api.getCloudCosts();
            if (!response || !response.costs) {
                throw new Error('Invalid cost data structure');
            }
            setCosts(response.costs);
            setError(null);
        } catch (err) {
            console.error("Error fetching cost data:", err);
            setError('Failed to load cost data. Please try again later.');
            // Set fallback mock data
            setCosts([
                { provider: 'AWS', service: 'EC2', cost: 120.50, date: '2025-02-20' },
                { provider: 'Azure', service: 'VM', cost: 98.75, date: '2025-02-21' },
                { provider: 'GCP', service: 'Compute Engine', cost: 85.20, date: '2025-02-22' },
                { provider: 'AWS', service: 'S3', cost: 65.30, date: '2025-02-23' },
                { provider: 'AWS', service: 'RDS', cost: 110.45, date: '2025-02-24' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCosts();
    }, []);

    if (isLoading) {
        return (
            <TableContainer component={Paper}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Loading cost data...
                    </Typography>
                </Box>
            </TableContainer>
        );
    }

    if (error) {
        return (
            <TableContainer component={Paper}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }} 
                        onClick={fetchCosts}
                    >
                        Retry
                    </Button>
                </Box>
            </TableContainer>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Typography variant="h6" align="center" sx={{ padding: 2 }}>
                Cloud Cost Breakdown
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><b>Provider</b></TableCell>
                        <TableCell><b>Service</b></TableCell>
                        <TableCell><b>Cost ($)</b></TableCell>
                        <TableCell><b>Date</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!costs || costs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No cost data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        costs.map((cost, index) => (
                            <TableRow key={index}>
                                <TableCell>{cost.provider}</TableCell>
                                <TableCell>{cost.service}</TableCell>
                                <TableCell>${cost.cost.toFixed(2)}</TableCell>
                                <TableCell>{cost.date}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CostTable;