import React, { useEffect, useState } from "react";
import { getCloudCosts } from "../services/api";

const CostDashboard = () => {
    const [costs, setCosts] = useState([]);

    useEffect(() => {
        getCloudCosts().then(data => setCosts(data));
    }, []);

    return (
        <div>
            <h2>Cloud Cost Overview</h2>
            <ul>
                {costs.map((cost, index) => (
                    <li key={index}>
                        {cost.provider}: ${cost.cost} - {cost.service}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CostDashboard;
