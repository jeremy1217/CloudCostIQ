import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import axios from 'axios';

const Dashboard = () => {
  const [costData, setCostData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCostData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/costs/summary');
        setCostData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cost data');
        setLoading(false);
      }
    };
    
    fetchCostData();
  }, []);
  
  if (loading) return <div className="flex justify-center p-12">Loading...</div>;
  if (error) return <div className="text-red-500 p-12">{error}</div>;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cloud Cost Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Spend</h2>
          <p className="text-4xl font-bold text-indigo-600">${costData.totalSpend}</p>
          <p className="text-sm text-gray-500 mt-2">
            {costData.spendChange > 0 ? '+' : ''}{costData.spendChange}% from last month
          </p>
        </div>
        
        {/* Add more summary cards here */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cost Trends</h2>
          <Line 
            data={costData.trendData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Services</h2>
          <Bar 
            data={costData.serviceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;