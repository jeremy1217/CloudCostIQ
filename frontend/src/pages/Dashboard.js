import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress } from "@mui/material";

const Dashboard = () => {
    const [costBreakdown, setCostBreakdown] = useState([]);  // ✅ Initialize as an empty array
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data instead of API call
        const mockCostBreakdown = [
            { provider: "AWS", service: "EC2", cost: 120.50 },
            { provider: "Azure", service: "VM", cost: 98.75 },
            { provider: "GCP", service: "Compute Engine", cost: 85.20 }
        ];
        
        setCostBreakdown(mockCostBreakdown);
        setLoading(false);
        
        // Comment out the axios call for now
        /*
        axios.get("http://localhost:8000/insights/cost-breakdown")
            .then(...)
        */
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
