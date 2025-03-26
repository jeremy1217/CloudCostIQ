import React, { useEffect, useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CostChart = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        api.getCloudCosts().then(response => {
            if (!response || !response.costs) {
                console.error('Invalid cost data structure:', response);
                return;
            }
            
            // Group costs by date and service
            const costsByDate = response.costs.reduce((acc, cost) => {
                const date = cost.date;
                if (!acc[date]) {
                    acc[date] = {
                        date,
                        total: 0
                    };
                }
                const serviceName = `${cost.provider} - ${cost.service}`;
                acc[date][serviceName] = cost.cost;
                acc[date].total += cost.cost;
                return acc;
            }, {});

            // Convert to array format for chart
            const formattedData = Object.values(costsByDate);

            // Sort by date
            formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setChartData(formattedData);
        }).catch(error => {
            console.error('Error fetching cost data:', error);
        });
    }, []);

    // Get unique services from the data
    const services = chartData.length > 0 
        ? Object.keys(chartData[0]).filter(key => key !== 'date' && key !== 'total')
        : [];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Cost"
                    stroke="#8884d8" 
                    strokeWidth={2}
                />
                {services.map((service, index) => (
                    <Line
                        key={service}
                        type="monotone"
                        dataKey={service}
                        name={service}
                        stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                        strokeDasharray="5 5"
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CostChart;
