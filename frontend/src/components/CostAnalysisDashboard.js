// src/components/CostAnalysisDashboard.js
import React, { useState } from 'react';
import Layout from './Layout';
import CostExplorer from './cost-analysis/CostExplorer';
import DailyCostChart from './cost-analysis/DailyCostChart';
import { useAuth } from '../context/AuthContext';
import { getDailyCosts } from '../services/cost-analysis';

const CostAnalysisDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('explorer');
  const [dailyCostData, setDailyCostData] = useState(null);
  const [dailyCostLoading, setDailyCostLoading] = useState(false);
  
  // Function to fetch daily cost data (only when tab is selected)
  const fetchDailyCosts = async () => {
    if (dailyCostData) return; // Already fetched
    
    setDailyCostLoading(true);
    try {
      const data = await getDailyCosts(30);
      setDailyCostData(data);
    } catch (error) {
      console.error('Error fetching daily costs:', error);
    } finally {
      setDailyCostLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch daily costs data when switching to the daily tab
    if (tab === 'daily' && !dailyCostData) {
      fetchDailyCosts();
    }
  };
  
  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Cost Analysis</h1>
            <p className="mt-2 text-sm text-gray-700">
              Analyze and visualize your cloud spending across all accounts, services, and resources.
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('explorer')}
              className={`${
                activeTab === 'explorer'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Cost Explorer
            </button>
            <button
              onClick={() => handleTabChange('daily')}
              className={`${
                activeTab === 'daily'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Daily Costs
            </button>
          </nav>
        </div>
        
        {/* Explorer Tab */}
        {activeTab === 'explorer' && (
          <div className="mt-6">
            <CostExplorer />
          </div>
        )}
        
        {/* Daily Costs Tab */}
        {activeTab === 'daily' && (
          <div className="mt-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Daily Costs (Last 30 Days)
                </h3>
                <div className="mt-2" style={{ height: '400px' }}>
                  {dailyCostLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <DailyCostChart data={dailyCostData} />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Daily Cost Insights
                </h3>
                <div className="mt-4">
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Highest Daily Cost
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {dailyCostData && !dailyCostLoading ? (
                          `$${Math.max(...dailyCostData.costs).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}`
                        ) : (
                          '-'
                        )}
                      </dd>
                    </div>
                    
                    <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Daily Cost
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {dailyCostData && !dailyCostLoading ? (
                          `$${(dailyCostData.costs.reduce((a, b) => a + b, 0) / dailyCostData.costs.length).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}`
                        ) : (
                          '-'
                        )}
                      </dd>
                    </div>
                    
                    <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Cost Trend
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold">
                        {dailyCostData && !dailyCostLoading ? (
                          <div className="flex items-center">
                            {(() => {
                              // Calculate trend by comparing first half with second half
                              const halfIndex = Math.floor(dailyCostData.costs.length / 2);
                              const firstHalf = dailyCostData.costs.slice(0, halfIndex);
                              const secondHalf = dailyCostData.costs.slice(halfIndex);
                              
                              const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                              const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
                              
                              const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
                              
                              // Display trend icon and percentage
                              if (percentChange > 1) {
                                return (
                                  <>
                                    <span className="text-red-600">↑</span>
                                    <span className="ml-1 text-red-600">{percentChange.toFixed(1)}%</span>
                                  </>
                                );
                              } else if (percentChange < -1) {
                                return (
                                  <>
                                    <span className="text-green-600">↓</span>
                                    <span className="ml-1 text-green-600">{Math.abs(percentChange).toFixed(1)}%</span>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <span className="text-gray-600">→</span>
                                    <span className="ml-1 text-gray-600">Stable</span>
                                  </>
                                );
                              }
                            })()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cost Patterns
                </h3>
                <div className="mt-4">
                  {dailyCostData && !dailyCostLoading ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">
                        <strong>Weekday vs. Weekend:</strong> Your average weekday spend is
                        {(() => {
                          const weekdayCosts = dailyCostData.costs.filter((_, index) => {
                            const date = new Date(dailyCostData.dates[index]);
                            const day = date.getDay();
                            return day >= 1 && day <= 5; // Monday-Friday
                          });
                          
                          const weekendCosts = dailyCostData.costs.filter((_, index) => {
                            const date = new Date(dailyCostData.dates[index]);
                            const day = date.getDay();
                            return day === 0 || day === 6; // Sunday or Saturday
                          });
                          
                          const weekdayAvg = weekdayCosts.reduce((a, b) => a + b, 0) / weekdayCosts.length;
                          const weekendAvg = weekendCosts.reduce((a, b) => a + b, 0) / weekendCosts.length;
                          
                          const diff = ((weekdayAvg - weekendAvg) / weekendAvg) * 100;
                          
                          return (
                            <span className={diff > 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                              {' '}{diff > 0 ? diff.toFixed(1) + '% higher' : Math.abs(diff).toFixed(1) + '% lower'}{' '}
                            </span>
                          );
                        })()}
                        than weekend spend.
                      </p>
                      
                      <p className="text-sm text-gray-700">
                        <strong>Cost Variability:</strong>
                        {(() => {
                          const stdDev = Math.sqrt(
                            dailyCostData.costs.reduce((sum, cost) => {
                              const avg = dailyCostData.costs.reduce((a, b) => a + b, 0) / dailyCostData.costs.length;
                              return sum + Math.pow(cost - avg, 2);
                            }, 0) / dailyCostData.costs.length
                          );
                          
                          const avg = dailyCostData.costs.reduce((a, b) => a + b, 0) / dailyCostData.costs.length;
                          const cv = (stdDev / avg) * 100; // Coefficient of variation
                          
                          let assessment;
                          if (cv < 10) {
                            assessment = 'Your daily costs are very consistent, indicating steady usage patterns.';
                          } else if (cv < 25) {
                            assessment = 'Your daily costs show moderate variability, which is typical for most workloads.';
                          } else {
                            assessment = 'Your daily costs show high variability, which might indicate spiky usage patterns or potential cost optimization opportunities.';
                          }
                          
                          return (
                            <span className="text-gray-900">
                              {' '}{assessment}
                            </span>
                          );
                        })()}
                      </p>
                      
                      <p className="text-sm text-gray-700">
                        <strong>Monthly Projection:</strong> Based on your current daily average, your projected monthly cost is
                        {' '}
                        <span className="text-gray-900 font-semibold">
                          ${(dailyCostData.costs.reduce((a, b) => a + b, 0) / dailyCostData.costs.length * 30).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Loading cost pattern analysis...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CostAnalysisDashboard;