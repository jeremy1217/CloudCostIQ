import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const EnhancedRecommendationsDashboard = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [accounts, setAccounts] = useState([]);
  const [currentView, setCurrentView] = useState('cards'); // 'cards' or 'table'
  
  // Fetch recommendations when component mounts or selected account changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // This would be your actual API call
        const endpoint = selectedAccount === 'all' 
          ? '/api/costs/enhanced/recommendations/enhanced'
          : `/api/costs/enhanced/recommendations/enhanced?account_id=${selectedAccount}`;
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendation data');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAccounts = async () => {
      try {
        // This would be your actual API call
        const response = await fetch('/api/cloud-accounts');
        if (!response.ok) throw new Error('Failed to fetch accounts');
        
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    
    fetchRecommendations();
    fetchAccounts();
  }, [selectedAccount]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Prepare data for savings by category chart
  const prepareSavingsChartData = () => {
    if (!recommendations) return null;
    
    const categories = [
      { key: 'idle_resources', label: 'Idle Resources', color: 'rgba(66, 153, 225, 0.8)' },
      { key: 'rightsizing_recommendations', label: 'Rightsizing', color: 'rgba(72, 187, 120, 0.8)' },
      { key: 'reserved_instance_recommendations', label: 'Reserved Instances', color: 'rgba(159, 122, 234, 0.8)' },
      { key: 'storage_optimization_recommendations', label: 'Storage', color: 'rgba(237, 137, 54, 0.8)' },
      { key: 'network_optimization_recommendations', label: 'Network', color: 'rgba(226, 74, 74, 0.8)' }
    ];
    
    const savingsData = categories.map(category => {
      let savings = 0;
      
      if (category.key === 'idle_resources') {
        savings = recommendations.idle_resources.reduce((sum, rec) => sum + rec.estimated_savings, 0);
      } else if (category.key === 'rightsizing_recommendations') {
        savings = recommendations.rightsizing_recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0);
      } else if (category.key === 'reserved_instance_recommendations') {
        // For RI, convert annual savings to monthly to be consistent
        savings = recommendations.reserved_instance_recommendations.reduce(
          (sum, rec) => sum + (rec.estimated_savings_1yr / 12), 0);
      } else if (category.key === 'storage_optimization_recommendations') {
        savings = recommendations.storage_optimization_recommendations.reduce(
          (sum, rec) => sum + rec.estimated_savings, 0);
      } else if (category.key === 'network_optimization_recommendations') {
        savings = recommendations.network_optimization_recommendations.reduce(
          (sum, rec) => sum + rec.estimated_savings, 0);
      }
      
      return {
        category: category.label,
        savings,
        color: category.color
      };
    });
    
    return {
      labels: savingsData.map(item => item.category),
      datasets: [
        {
          data: savingsData.map(item => item.savings),
          backgroundColor: savingsData.map(item => item.color),
          borderColor: savingsData.map(item => item.color.replace('0.8', '1')),
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare data for recommendations by confidence chart
  const prepareConfidenceChartData = () => {
    if (!recommendations) return null;
    
    const confidenceLevels = {
      high: { count: 0, color: 'rgba(72, 187, 120, 0.8)' },
      medium: { count: 0, color: 'rgba(237, 137, 54, 0.8)' },
      low: { count: 0, color: 'rgba(226, 74, 74, 0.8)' }
    };
    
    // Count recommendations by confidence
    const countByConfidence = (recs) => {
      recs.forEach(rec => {
        if (rec.confidence in confidenceLevels) {
          confidenceLevels[rec.confidence].count += 1;
        }
      });
    };
    
    countByConfidence(recommendations.idle_resources);
    countByConfidence(recommendations.rightsizing_recommendations);
    countByConfidence(recommendations.reserved_instance_recommendations);
    countByConfidence(recommendations.storage_optimization_recommendations);
    countByConfidence(recommendations.network_optimization_recommendations);
    
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          data: [
            confidenceLevels.high.count,
            confidenceLevels.medium.count,
            confidenceLevels.low.count
          ],
          backgroundColor: [
            confidenceLevels.high.color,
            confidenceLevels.medium.color,
            confidenceLevels.low.color
          ],
          borderColor: [
            confidenceLevels.high.color.replace('0.8', '1'),
            confidenceLevels.medium.color.replace('0.8', '1'),
            confidenceLevels.low.color.replace('0.8', '1')
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Get the count of recommendations by category
  const getRecommendationCounts = () => {
    if (!recommendations) return {};
    
    return {
      idle: recommendations.idle_resources.length,
      rightsizing: recommendations.rightsizing_recommendations.length,
      reservedInstance: recommendations.reserved_instance_recommendations.length,
      storage: recommendations.storage_optimization_recommendations.length,
      network: recommendations.network_optimization_recommendations.length,
      total: recommendations.idle_resources.length +
             recommendations.rightsizing_recommendations.length +
             recommendations.reserved_instance_recommendations.length +
             recommendations.storage_optimization_recommendations.length +
             recommendations.network_optimization_recommendations.length
    };
  };
  
  const savingsChartData = recommendations ? prepareSavingsChartData() : null;
  const confidenceChartData = recommendations ? prepareConfidenceChartData() : null;
  const recommendationCounts = recommendations ? getRecommendationCounts() : {};
  
  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Recommendations'
        }
      }
    }
  };
  
  // Render summary tab
  const renderSummary = () => {
    if (!recommendations) return null;
    
    const totalSavings = recommendations.total_estimated_savings;
    const monthlyEstimate = totalSavings / 12; // Convert to monthly
    
    return (
      <div className="space-y-6">
        {/* Total savings card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-lg font-medium text-gray-900 truncate">
                    Estimated Monthly Savings
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-semibold text-green-600">
                      {formatCurrency(monthlyEstimate)}
                    </div>
                    <div className="ml-2 text-sm font-medium text-gray-500">
                      per month
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              {formatCurrency(totalSavings)} estimated annual savings from {recommendationCounts.total} recommendations
            </div>
          </div>
        </div>
        
        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Savings by category */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Savings by Category</h3>
              <div className="mt-4" style={{ height: '300px' }}>
                {savingsChartData ? (
                  <Doughnut data={savingsChartData} options={doughnutOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recommendations by confidence */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">Recommendations by Confidence</h3>
              <div className="mt-4" style={{ height: '300px' }}>
                {confidenceChartData ? (
                  <Bar data={confidenceChartData} options={barOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Top recommendations */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Recommendations</h3>
          </div>
          <div className="p-5">
            {recommendations.top_recommendations && recommendations.top_recommendations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recommendations.top_recommendations.slice(0, 5).map((item, index) => {
                  const rec = item.recommendation;
                  // Determine icon based on category
                  let icon;
                  let bgColor;
                  
                  if (item.category === 'idle_resources') {
                    icon = (
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                    bgColor = 'bg-blue-50';
                  } else if (item.category === 'rightsizing_recommendations') {
                    icon = (
                      <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    );
                    bgColor = 'bg-green-50';
                  } else if (item.category === 'reserved_instance_recommendations') {
                    icon = (
                      <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    );
                    bgColor = 'bg-purple-50';
                  } else if (item.category === 'storage_optimization_recommendations') {
                    icon = (
                      <svg className="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    );
                    bgColor = 'bg-orange-50';
                  } else if (item.category === 'network_optimization_recommendations') {
                    icon = (
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    );
                    bgColor = 'bg-red-50';
                  }
                  
                  // Calculate savings (handle RI differently)
                  const savings = item.category === 'reserved_instance_recommendations'
                    ? rec.estimated_savings_1yr / 12  // Monthly
                    : rec.estimated_savings;
                  
                  return (
                    <li key={index} className="py-4">
                      <div className="flex items-center">
                        <div className={`${bgColor} p-2 rounded-md`}>
                          {icon}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {rec.service}
                          </p>
                          <p className="text-sm text-gray-500">
                            {rec.recommendation}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(savings)}/mo
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {rec.confidence} confidence
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No recommendations available
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View All Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render all recommendations tab
  const renderAllRecommendations = () => {
    if (!recommendations) return null;
    
    // Get all recommendations in a flat structure
    const allRecommendations = [
      ...recommendations.idle_resources.map(rec => ({ type: 'Idle Resources', ...rec })),
      ...recommendations.rightsizing_recommendations.map(rec => ({ type: 'Rightsizing', ...rec })),
      ...recommendations.reserved_instance_recommendations.map(rec => ({
        type: 'Reserved Instances',
        ...rec,
        estimated_savings: rec.estimated_savings_1yr / 12  // Convert to monthly
      })),
      ...recommendations.storage_optimization_recommendations.map(rec => ({ type: 'Storage', ...rec })),
      ...recommendations.network_optimization_recommendations.map(rec => ({ type: 'Network', ...rec }))
    ];
    
    // Sort by estimated savings (highest first)
    allRecommendations.sort((a, b) => b.estimated_savings - a.estimated_savings);
    
    return (
      <div className="space-y-6">
        {/* View options */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              Showing {allRecommendations.length} recommendations
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-4">
              <div>
                <button
                  onClick={() => setCurrentView('cards')}
                  className={`px-3 py-2 text-sm font-medium rounded ${
                    currentView === 'cards' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => setCurrentView('table')}
                  className={`px-3 py-2 text-sm font-medium rounded ${
                    currentView === 'table' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card view */}
        {currentView === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRecommendations.map((rec, index) => {
              // Determine icon and color based on recommendation type
              let icon;
              let bgColor;
              let borderColor;
              
              if (rec.type === 'Idle Resources') {
                icon = (
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-200';
              } else if (rec.type === 'Rightsizing') {
                icon = (
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                );
                bgColor = 'bg-green-50';
                borderColor = 'border-green-200';
              } else if (rec.type === 'Reserved Instances') {
                icon = (
                  <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                );
                bgColor = 'bg-purple-50';
                borderColor = 'border-purple-200';
              } else if (rec.type === 'Storage') {
                icon = (
                  <svg className="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                );
                bgColor = 'bg-orange-50';
                borderColor = 'border-orange-200';
              } else if (rec.type === 'Network') {
                icon = (
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                );
                bgColor = 'bg-red-50';
                borderColor = 'border-red-200';
              }
              
              return (
                <div key={index} className={`border ${borderColor} rounded-lg overflow-hidden`}>
                  <div className={`${bgColor} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center">
                      {icon}
                      <h3 className="ml-2 text-sm font-medium text-gray-900">{rec.type}</h3>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.confidence === 'high' 
                          ? 'bg-green-100 text-green-800' 
                          : rec.confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.confidence} confidence
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-white">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {rec.service}
                      {rec.resource_id && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({rec.resource_id.substring(0, 10)}...)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {rec.recommendation}
                    </p>
                    
                    {/* Show additional details based on recommendation type */}
                    {rec.type === 'Rightsizing' && rec.current_type && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div>Current type: <span className="font-medium">{rec.current_type}</span></div>
                        <div>Recommended: <span className="font-medium">{rec.recommended_type}</span></div>
                      </div>
                    )}
                    
                    {rec.type === 'Reserved Instances' && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div>Instance type: <span className="font-medium">{rec.instance_type}</span></div>
                        <div>Provider: <span className="font-medium">{rec.provider}</span></div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Monthly savings</div>
                        <div className="text-base font-medium text-green-600">
                          {formatCurrency(rec.estimated_savings)}
                        </div>
                      </div>
                      <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Table view */}
        {currentView === 'table' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service/Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommendation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Savings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allRecommendations.map((rec, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.type === 'Idle Resources' 
                            ? 'bg-blue-100 text-blue-800' 
                            : rec.type === 'Rightsizing'
                              ? 'bg-green-100 text-green-800'
                              : rec.type === 'Reserved Instances'
                                ? 'bg-purple-100 text-purple-800'
                                : rec.type === 'Storage'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{rec.service}</div>
                        <div className="text-xs text-gray-500">{rec.resource_id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <div className="line-clamp-2">{rec.recommendation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.confidence === 'high' 
                            ? 'bg-green-100 text-green-800' 
                            : rec.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.confidence}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(rec.estimated_savings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render by category tabs
  const renderCategoryTab = (category) => {
    if (!recommendations) return null;
    
    let items = [];
    let title = '';
    
    switch (category) {
      case 'idle':
        items = recommendations.idle_resources;
        title = 'Idle Resources';
        break;
      case 'rightsizing':
        items = recommendations.rightsizing_recommendations;
        title = 'Rightsizing Recommendations';
        break;
      case 'reserved':
        items = recommendations.reserved_instance_recommendations;
        title = 'Reserved Instance Recommendations';
        break;
      case 'storage':
        items = recommendations.storage_optimization_recommendations;
        title = 'Storage Optimization';
        break;
      case 'network':
        items = recommendations.network_optimization_recommendations;
        title = 'Network Optimization';
        break;
      default:
        items = [];
        title = 'Recommendations';
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        
        {items.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center text-gray-500">
            No {title.toLowerCase()} available.
          </div>
        ) : (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service/Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommendation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {category === 'reserved' ? 'Annual Savings' : 'Monthly Savings'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((rec, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{rec.service}</div>
                        <div className="text-xs text-gray-500">{rec.resource_id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <div className="line-clamp-2">{rec.recommendation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.confidence === 'high' 
                            ? 'bg-green-100 text-green-800' 
                            : rec.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rec.confidence}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {category === 'reserved' 
                          ? formatCurrency(rec.estimated_savings_1yr)
                          : formatCurrency(rec.estimated_savings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Enhanced Cost Recommendations</h1>
        
        {/* Account selector */}
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-700">Cloud Account:</span>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`${
                  activeTab === 'summary'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Recommendations
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
                {recommendationCounts.idle > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                    {recommendationCounts.idle}
                  </span>
                )}
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
                {recommendationCounts.rightsizing > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                    {recommendationCounts.rightsizing}
                  </span>
                )}
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
                {recommendationCounts.reservedInstance > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                    {recommendationCounts.reservedInstance}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`${
                  activeTab === 'storage'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Storage
                {recommendationCounts.storage > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800">
                    {recommendationCounts.storage}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'all' && renderAllRecommendations()}
          {activeTab === 'idle' && renderCategoryTab('idle')}
          {activeTab === 'rightsizing' && renderCategoryTab('rightsizing')}
          {activeTab === 'reserved' && renderCategoryTab('reserved')}
          {activeTab === 'storage' && renderCategoryTab('storage')}
          {activeTab === 'network' && renderCategoryTab('network')}
        </div>
      )}
    </div>
  );
};

export default EnhancedRecommendationsDashboard;