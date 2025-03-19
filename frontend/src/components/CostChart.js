import React, { useEffect, useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CostChart = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        api.getCloudCosts().then(response => {
            if (!response || !response.costs) {
                console.error('Invalid cost data structure:', response);
                return;
            }
            
            // Group costs by date
            const costsByDate = response.costs.reduce((acc, cost) => {
                const date = cost.date;
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date] += cost.cost;
                return acc;
            }, {});

            // Convert to array format for chart
            const formattedData = Object.entries(costsByDate).map(([date, totalCost]) => ({
                date,
                cost: parseFloat(totalCost.toFixed(2))
            }));

            // Sort by date
            formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setChartData(formattedData);
        }).catch(error => {
            console.error('Error fetching cost data:', error);
        });
    }, []);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="cost" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CostChart;
