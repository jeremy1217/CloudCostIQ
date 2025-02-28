import React, { useEffect, useState } from "react";
import { getCloudCosts } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CostChart = () => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        getCloudCosts().then(data => {
            const formattedData = data.map(cost => ({
                date: cost.date,
                cost: cost.cost,
            }));
            setChartData(formattedData);
        });
    }, []);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CostChart;
