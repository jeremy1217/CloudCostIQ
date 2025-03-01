import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress } from "@mui/material";

const Dashboard = () => {
    const [costBreakdown, setCostBreakdown] = useState([]);  // ✅ Initialize as an empty array
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/insights/cost-breakdown") // Update the endpoint path
            .then(response => {
                setCostBreakdown(response.data?.cost_breakdown || []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching cost breakdown:", error);
                setCostBreakdown([]);
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
