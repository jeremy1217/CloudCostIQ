import React, { useEffect, useState } from "react";
import { getCloudCosts } from "../services/api";

const CostDashboard = () => {
    const [costs, setCosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                const response = await getCloudCosts();
                if (!response || !response.costs) {
                    throw new Error('Invalid cost data structure');
                }
                setCosts(response.costs);
                setError(null);
            } catch (err) {
                console.error('Error fetching cost data:', err);
                setError('Failed to load cost data');
                // Set fallback mock data
                setCosts([
                    { provider: 'AWS', cost: 120.50, service: 'EC2' },
                    { provider: 'Azure', cost: 98.75, service: 'VM' },
                    { provider: 'GCP', cost: 85.20, service: 'Compute Engine' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCosts();
    }, []);

    if (loading) {
        return <div>Loading cost data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Cloud Cost Overview</h2>
            <ul>
                {costs.map((cost, index) => (
                    <li key={index}>
                        {cost.provider}: ${cost.cost.toFixed(2)} - {cost.service}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CostDashboard;
