import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const EnhancedAnomalyDashboard = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [contextualAnomalies, setContextualAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('anomalies');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [methodCounts, setMethodCounts] = useState({});
  const [sensitivity, setSensitivity] = useState(2.0);
  const [chartData, setChartData] = useState(null);
  
  // Fetch anomalies when component mounts or when parameters change
  useEffect(() => {
    const fetchAnomalies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // This would be your actual API call
        const response = await fetch(`/api/costs/enhanced/anomalies/enhanced?sensitivity=${sensitivity}`);
        if (!response.ok) throw new Error('Failed to fetch anomalies');
        
        const data = await response.json();
        setAnomalies(data);
        
        // Count anomalies by detection method
        const counts = data.reduce((acc, anomaly) => {
          const method = anomaly.detection_method;
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {});
        setMethodCounts(counts);
        
        // Prepare chart data
        prepareChartData(data);
      } catch (err) {
        console.error('Error fetching anomalies:', err);
        setError('Failed to load anomaly data');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchContextualAnomalies = async () => {
      try {
        // This would be your actual API call
        const response = await fetch('/api/costs/enhanced/anomalies/contextual');
        if (!response.ok) throw new Error('Failed to fetch contextual anomalies');
        
        const data = await response.json();
        setContextualAnomalies(data);
      } catch (err) {
        console.error('Error fetching contextual anomalies:', err);
      }
    };
    
    fetchAnomalies();
    fetchContextualAnomalies();
  }, [sensitivity]);
  
  // Prepare data for the time series chart
  const prepareChartData = (anomalies) => {
    // Group anomalies by date
    const anomaliesByDate = {};
    const methodColor = {
      'z_score': 'rgba(255, 99, 132, 0.8)',
      'isolation_forest': 'rgba(54, 162, 235, 0.8)',
      'time_series_decomposition': 'rgba(75, 192, 192, 0.8)',
      'exponential_smoothing': 'rgba(153, 102, 255, 0.8)'
    };
    
    // Group anomalies by date and detection method
    anomalies.forEach(anomaly => {
      const date = format(new Date(anomaly.date), 'yyyy-MM-dd');
      if (!anomaliesByDate[date]) {
        anomaliesByDate[date] = {
          total: 0,
          methods: {}
        };
      }
      
      anomaliesByDate[date].total += 1;
      const method = anomaly.detection_method;
      anomaliesByDate[date].methods[method] = (anomaliesByDate[date].methods[method] || 0) + 1;
    });
    
    // Sort dates
    const sortedDates = Object.keys(anomaliesByDate).sort();
    
    // Create datasets for each detection method
    const datasets = Object.keys(methodColor).map(method => ({
      label: method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: sortedDates.map(date => anomaliesByDate[date].methods[method] || 0),
      backgroundColor: methodColor[method],
      borderColor: methodColor[method],
      borderWidth: 1
    }));
    
    setChartData({
      labels: sortedDates,
      datasets
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get filtered anomalies based on selected method
  const filteredAnomalies = selectedMethod === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.detection_method === selectedMethod);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Anomalies'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Anomalies Detected Over Time'
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Enhanced Anomaly Detection</h2>
        <p className="text-sm text-gray-500">
          Advanced anomaly detection using machine learning and time series analysis.
        </p>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`${
              activeTab === 'anomalies'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Cost Anomalies
          </button>
          <button
            onClick={() => setActiveTab('contextual')}
            className={`${
              activeTab === 'contextual'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Contextual Anomalies
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`${
              activeTab === 'dashboard'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Anomaly Dashboard
          </button>
        </nav>
      </div>
      
      {/* Settings and Filters */}
      {activeTab === 'anomalies' && (
        <div className="mb-4 bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="sensitivity" className="block text-sm font-medium text-gray-700">
              Sensitivity
            </label>
            <select
              id="sensitivity"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="1.0">High Sensitivity (1.0)</option>
              <option value="2.0">Medium Sensitivity (2.0)</option>
              <option value="3.0">Low Sensitivity (3.0)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700">
              Detection Method
            </label>
            <select
              id="method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Methods</option>
              <option value="z_score">Z-Score ({methodCounts.z_score || 0})</option>
              <option value="isolation_forest">Isolation Forest ({methodCounts.isolation_forest || 0})</option>
              <option value="time_series_decomposition">Time Series ({methodCounts.time_series_decomposition || 0})</option>
              <option value="exponential_smoothing">Exponential Smoothing ({methodCounts.exponential_smoothing || 0})</option>
            </select>
          </div>
          
          <div className="flex-1 ml-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{anomalies.length}</span> anomalies detected
            </div>
            <div className="text-xs text-gray-500">
              Showing top anomalies with highest confidence
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {/* Anomalies Tab */}
      {!loading && !error && activeTab === 'anomalies' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Diff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No anomalies detected with the current settings.
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((anomaly, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {anomaly.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(anomaly.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(anomaly.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        anomaly.percent_difference > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {anomaly.percent_difference > 0 ? '+' : ''}{anomaly.percent_difference.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {anomaly.detection_method.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${anomaly.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {(anomaly.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Contextual Anomalies Tab */}
      {!loading && !error && activeTab === 'contextual' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contextual Anomalies</h3>
          <p className="text-sm text-gray-500">
            Patterns and behaviors that are anomalous in a specific context, like unusual weekend usage.
          </p>
          
          {contextualAnomalies.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center">
              No contextual anomalies detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contextualAnomalies.map((anomaly, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">
                        {anomaly.service}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {anomaly.description}
                      </p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {anomaly.subtype.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  {anomaly.metrics && (
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(anomaly.metrics).map(([key, value]) => (
                        <div key={key} className="bg-white rounded p-2">
                          <div className="text-xs text-gray-500">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="font-medium">
                            {typeof value === 'number' ? value.toFixed(1) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-xs mr-1">Confidence:</div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full" 
                          style={{ width: `${anomaly.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="text-xs text-indigo-600 hover:text-indigo-900 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Dashboard Tab */}
      {!loading && !error && activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Anomalies by method chart */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Anomalies by Detection Method
              </h3>
              <div className="h-60">
                {Object.keys(methodCounts).length > 0 ? (
                  <Bar 
                    data={{
                      labels: Object.keys(methodCounts).map(method => 
                        method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      ),
                      datasets: [
                        {
                          label: 'Anomalies Detected',
                          data: Object.values(methodCounts),
                          backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                          ]
                        }
                      ]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>
            
            {/* Anomalies over time chart */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Anomalies Over Time
              </h3>
              <div className="h-60">
                {chartData ? (
                  <Bar 
                    data={chartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          stacked: true,
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total anomalies */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Anomalies</p>
                  <p className="text-2xl font-semibold text-gray-900">{anomalies.length}</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-full">
                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Across all detection methods</p>
            </div>
            
            {/* High confidence anomalies */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">High Confidence</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {anomalies.filter(a => a.confidence > 0.8).length}
                  </p>
                </div>
                <div className="p-2 bg-red-50 rounded-full">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Anomalies with >80% confidence</p>
            </div>
            
            {/* Recent anomalies */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Recent Anomalies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {anomalies.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
                      return daysDiff <= 7;
                    }).length}
                  </p>
                </div>
                <div className="p-2 bg-orange-50 rounded-full">
                  <svg className="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Detected in the last 7 days</p>
            </div>
          </div>
          
          {/* Anomaly insights */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Anomaly Insights</h3>
            
            <div className="divide-y divide-gray-200">
              {/* Most frequent services with anomalies */}
              <div className="py-4">
                <h4 className="text-sm font-medium text-gray-700">Top Services with Anomalies</h4>
                <div className="mt-3">
                  {(() => {
                    // Count anomalies by service
                    const serviceCounts = anomalies.reduce((acc, anomaly) => {
                      acc[anomaly.service] = (acc[anomaly.service] || 0) + 1;
                      return acc;
                    }, {});
                    
                    // Sort and take top 5 services
                    const topServices = Object.entries(serviceCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5);
                    
                    return topServices.length > 0 ? (
                      <div className="space-y-2">
                        {topServices.map(([service, count], index) => (
                          <div key={index} className="flex items-center">
                            <div className="text-sm text-gray-700 w-1/3">{service}</div>
                            <div className="w-2/3 flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ width: `${(count / anomalies.length) * 100}%` }}
                                ></div>
                              </div>
                              <div className="ml-2 text-xs text-gray-500">{count}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No data available</div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Detection method effectiveness */}
              <div className="py-4">
                <h4 className="text-sm font-medium text-gray-700">Detection Method Effectiveness</h4>
                <div className="mt-3">
                  {(() => {
                    // Calculate average confidence by method
                    const methodConfidence = {};
                    const methodCounts = {};
                    
                    anomalies.forEach(anomaly => {
                      const method = anomaly.detection_method;
                      if (!methodConfidence[method]) {
                        methodConfidence[method] = 0;
                        methodCounts[method] = 0;
                      }
                      methodConfidence[method] += anomaly.confidence;
                      methodCounts[method] += 1;
                    });
                    
                    // Calculate averages and format for display
                    const methodsWithAvg = Object.keys(methodConfidence).map(method => ({
                      method,
                      avgConfidence: methodConfidence[method] / methodCounts[method],
                      count: methodCounts[method]
                    }));
                    
                    // Sort by average confidence
                    methodsWithAvg.sort((a, b) => b.avgConfidence - a.avgConfidence);
                    
                    return methodsWithAvg.length > 0 ? (
                      <div className="space-y-2">
                        {methodsWithAvg.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div className="text-sm text-gray-700 w-1/3">
                              {item.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="w-2/3 flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${item.avgConfidence * 100}%` }}
                                ></div>
                              </div>
                              <div className="ml-2 text-xs text-gray-500">
                                {(item.avgConfidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No data available</div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnomalyDashboard;