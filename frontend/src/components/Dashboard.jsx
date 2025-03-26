// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';
import api from './api';

export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      // In a real app, you would fetch data from your API
      setTimeout(() => {
        setSummaryData({
          totalSpend: 12580.45,
          spendChange: -8.3,
          projectedSpend: 15240.12,
          topServices: [
            { name: 'EC2', cost: 4536.78 },
            { name: 'S3', cost: 2387.15 },
            { name: 'RDS', cost: 1865.92 }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900">Welcome, {userProfile?.full_name}!</h1>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Cost Summary</h2>
        
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Month-to-Date Spend
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${summaryData.totalSpend.toLocaleString()}
              </dd>
              <div className={`mt-2 flex items-center text-sm ${summaryData.spendChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>{summaryData.spendChange}% from last month</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Projected Monthly Spend
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${summaryData.projectedSpend.toLocaleString()}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Cloud Accounts
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                3
              </dd>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Top Services by Cost</h2>
        
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {summaryData.topServices.map((service, index) => (
              <li key={index}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {service.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${service.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Recent Recommendations</h2>
        
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            <p>No recommendations available yet. Connect your cloud accounts to get started.</p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Connect Cloud Account
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;