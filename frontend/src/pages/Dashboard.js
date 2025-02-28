import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress } from "@mui/material";

const Dashboard = () => {
    const [costBreakdown, setCostBreakdown] = useState([]);  // ✅ Initialize as an empty array
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/cost-breakdown")
            .then(response => {
                setCostBreakdown(response.data?.cost_breakdown || []);  // ✅ Ensure it's always an array
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching cost breakdown:", error);
                setCostBreakdown([]);  // ✅ Fallback to an empty array on error
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Container><Typography>Loading cost breakdown...</Typography><CircularProgress /></Container>;
    }

    return (
        <Container>
            <Typography variant="h4" align="center" sx={{ marginBottom: 3 }}>
                Cost Breakdown 💰
            </Typography>

            {/* ✅ Safe mapping: Only map when costBreakdown has data */}
            {costBreakdown.length > 0 ? (
                costBreakdown.map((item, index) => (
                    <Typography key={index}>
                        {item.provider} - {item.service}: ${item.cost}
                    </Typography>
                ))
            ) : (
                <Typography>No cost data available.</Typography>
            )}
        </Container>
    );
};

export default Dashboard;
