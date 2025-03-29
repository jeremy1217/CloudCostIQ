// src/components/Recommendations.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import SavingsVisualization from './SavingsVisualization';
import { getAllRecommendations } from '../services/costs';

const RecommendationsDashboard = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedAccountId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRecommendations(selectedAccountId);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
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

  const renderSummary = () => {
    if (!recommendations) return null;

    const idleSavings = recommendations.idle_resources.reduce(
      (total, item) => total + item.estimated_savings, 0
    );
    
    const rightsizingSavings = recommendations.rightsizing_recommendations.reduce(
      (total, item) => total + item.estimated_savings, 0
    );
    
    const reservedInstanceSavings = recommendations.reserved_instance_recommendations.reduce(
      (total, item) => total + item.estimated_savings_1yr, 0
    );

    const anomalyCount = recommendations.anomalies.length;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900">Savings Opportunities</h2>
        
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Idle Resources
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {formatCurrency(idleSavings)}
              </dd>
              <p className="mt-2 text-sm text-gray-600">
                Estimated monthly savings from {recommendations.idle_resources.length} resources
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Rightsizing
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {formatCurrency(rightsizingSavings)}
              </dd>
              <p className="mt-2 text-sm text-gray-600">
                Estimated monthly savings from {recommendations.rightsizing_recommendations.length} resources
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Reserved Instances
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {formatCurrency(reservedInstanceSavings)}
              </dd>
              <p className="mt-2 text-sm text-gray-600">
                Estimated yearly savings from {recommendations.reserved_instance_recommendations.length} purchases
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Anomalies Detected
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-amber-600">
                {anomalyCount}
              </dd>
              <p className="mt-2 text-sm text-gray-600">
                Unusual spending patterns that need attention
              </p>
            </div>
          </div>
        </div>
        
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
      </div>
    );
  };

  const renderAnomalies = () => {
    if (!recommendations) return null;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900">Cost Anomalies</h2>
        <p className="mt-1 text-sm text-gray-500">
          Unusual spending patterns that might require attention
        </p>
        
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deviation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.anomalies.map((anomaly, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {anomaly.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {anomaly.resource_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(anomaly.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(anomaly.cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${anomaly.percent_difference > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {anomaly.percent_difference > 0 ? '+' : ''}{anomaly.percent_difference.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIdleResources = () => {
    if (!recommendations) return null;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900">Idle Resources</h2>
        <p className="mt-1 text-sm text-gray-500">
          Resources that appear to be unused or underutilized
        </p>
        
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Daily Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Savings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.idle_resources.map((resource, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resource.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.resource_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(resource.avg_daily_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(resource.estimated_savings)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRightsizing = () => {
    if (!recommendations) return null;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900">Rightsizing Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Resources that could be downsized based on usage patterns
        </p>
        
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimated Savings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.rightsizing_recommendations.map((resource, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resource.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.resource_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(resource.current_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(resource.estimated_savings)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReservedInstances = () => {
    if (!recommendations) return null;

    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900">Reserved Instance Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Long-running instances that could benefit from Reserved Instance pricing
        </p>
        
        <div className="mt-4 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Monthly Cost
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        1-Year Savings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        3-Year Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.reserved_instance_recommendations.map((resource, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resource.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.resource_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(resource.current_monthly_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(resource.estimated_savings_1yr)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(resource.estimated_savings_3yr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    if (!recommendations) {
      return (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No recommendation data available. Connect your cloud accounts to get started.</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return renderSummary();
      case 'anomalies':
        return renderAnomalies();
      case 'idle':
        return renderIdleResources();
      case 'rightsizing':
        return renderRightsizing();
      case 'reserved':
        return renderReservedInstances();
      default:
        return renderSummary();
    }
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
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={fetchRecommendations}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
        
        {renderContent()}
      </div>
  );
};

export default RecommendationsDashboard;