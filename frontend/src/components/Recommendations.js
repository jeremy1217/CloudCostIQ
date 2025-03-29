// src/components/Recommendations.js - Update to include enhanced recommendations
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import SavingsVisualization from './SavingsVisualization';
import { getAllRecommendations } from '../services/costs';
import EnhancedRecommendationsDashboard from './EnhancedRecommendationsDashboard';

const RecommendationsDashboard = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('enhanced'); // Changed default to 'enhanced'
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    // Only fetch standard recommendations when that tab is active
    if (activeTab !== 'enhanced') {
      fetchRecommendations();
    }
  }, [selectedAccountId, activeTab]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRecommendations(selectedAccountId);
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Cost Recommendations</h1>
            <p className="mt-2 text-sm text-gray-700">
              Recommendations to optimize your cloud spending and increase efficiency.
            </p>
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('enhanced')}
              className={`${
                activeTab === 'enhanced'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Enhanced Recommendations
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`${
                activeTab === 'summary'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Standard Summary
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`${
                activeTab === 'anomalies'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Anomalies
            </button>
            <button
              onClick={() => setActiveTab('idle')}
              className={`${
                activeTab === 'idle'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Idle Resources
            </button>
            <button
              onClick={() => setActiveTab('rightsizing')}
              className={`${
                activeTab === 'rightsizing'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Rightsizing
            </button>
            <button
              onClick={() => setActiveTab('reserved')}
              className={`${
                activeTab === 'reserved'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Reserved Instances
            </button>
          </nav>
        </div>
        
        {/* Enhanced Recommendations Dashboard */}
        {activeTab === 'enhanced' && (
          <div className="mt-6">
            <EnhancedRecommendationsDashboard 
              accountId={selectedAccountId}
              onAccountChange={setSelectedAccountId}
            />
          </div>
        )}
        
        {/* Legacy/Standard Recommendations - Only show when needed */}
        {activeTab !== 'enhanced' && (
          <>
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {/* Standard recommendation content */}
            {!loading && !error && recommendations && (
              <>
                {activeTab === 'summary' && (
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-900">Savings Opportunities</h2>
                    
                    {/* Savings cards */}
                    {/* ... existing code for summary view ... */}
                    
                    {/* Total summary card */}
                    <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Total Estimated Savings</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Potential monthly savings by implementing recommendations</p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(recommendations.total_estimated_savings / 12)} per month
                        </div>
                        <div className="mt-1 text-lg text-gray-700">
                          {formatCurrency(recommendations.total_estimated_savings)} per year
                        </div>
                      </div>
                    </div>
                    
                    {/* Visualization */}
                    <SavingsVisualization recommendations={recommendations} />
                  </div>
                )}
                
                {/* Other tabs - anomalies, idle, rightsizing, reserved */}
                {/* ... existing code for other tabs ... */}
              </>
            )}
          </>
        )}
      </div>
  );
};

export default RecommendationsDashboard;