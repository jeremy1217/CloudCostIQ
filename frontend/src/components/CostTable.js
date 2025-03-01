import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography } from "@mui/material";

    const CostTable = () => {
        const mockCosts = [
            { provider: "AWS", service: "EC2", cost: 120.50, date: "2025-02-20" },
            { provider: "Azure", service: "VM", cost: 98.75, date: "2025-02-21" },
            { provider: "GCP", service: "Compute Engine", cost: 85.20, date: "2025-02-22" },
        ];
    
        const [costs, setCosts] = useState([]);
    
        useEffect(() => {
            console.log("Fetching mock data...");
            setTimeout(() => {
                console.log("Mock data loaded:", mockCosts);
                setCosts(mockCosts);
            }, 1000);
        }, [mockCosts]); //

    console.log("Current costs state:", costs);  // Debugging

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
                    {costs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                Loading data...
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
