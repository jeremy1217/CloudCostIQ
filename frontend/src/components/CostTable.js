// frontend/src/components/CostTable.js
import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography, CircularProgress, Box, Button } from "@mui/material";
import { useCloudCosts } from '../hooks/useApi';

const CostTable = () => {
    const { data: costs, isLoading, isError, error, refetch } = useCloudCosts();

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

    if (isError) {
        return (
            <TableContainer component={Paper}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error?.message || 'Failed to load cost data. Please try again later.'}</Typography>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }} 
                        onClick={() => refetch()}
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