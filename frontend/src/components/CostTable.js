import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography, CircularProgress, Box } from "@mui/material";
import { getCloudCosts } from "../services/api";

const CostTable = () => {
    const [costs, setCosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                setLoading(true);
                const data = await getCloudCosts();
                setCosts(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching costs:", err);
                setError("Failed to load cost data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCosts();
    }, []);

    if (error) {
        return (
            <TableContainer component={Paper}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
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
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size={40} />
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : costs.length === 0 ? (
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