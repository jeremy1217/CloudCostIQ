// src/components/cost-analysis/CostExplorer.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TimeRangeSelector from './TimeRangeSelector';
import FilterBar from './FilterBar';
import CostTrendChart from './CostTrendChart';
import CostComparisonChart from './CostComparisonChart';
import CostBreakdownChart from './CostBreakdownChart';
import ServiceCostTable from './ServiceCostTable';

import { getCostTrend, getCostComparison, getCostBreakdown, exportCostsCSV } from '../../services/cost-analysis';

const CostExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filters
  const [timeRange, setTimeRange] = useState(searchParams.get('timeRange') || '30d');
  const [accountId, setAccountId] = useState(searchParams.get('accountId') || '');
  const [serviceFilter, setServiceFilter] = useState(searchParams.get('service') || '');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '');
  const [groupBy, setGroupBy] = useState(searchParams.get('groupBy') || 'service');
  
  // State for data
  const [trendData, setTrendData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Update URL when filters change
  useEffect(() => {
    const params = {};
    if (timeRange) params.timeRange = timeRange;
    if (accountId) params.accountId = accountId;
    if (serviceFilter) params.service = serviceFilter;
    if (tagFilter) params.tag = tagFilter;
    if (groupBy) params.groupBy = groupBy;
    
    setSearchParams(params);
  }, [timeRange, accountId, serviceFilter, tagFilter, groupBy, setSearchParams]);
  
  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Convert time range to days for API calls
        const days = timeRangeToDays(timeRange);
        
        // Fetch all data in parallel
        const [trendResponse, comparisonResponse, breakdownResponse] = await Promise.all([
          getCostTrend(days, accountId, serviceFilter, tagFilter),
          getCostComparison(days, accountId, serviceFilter, tagFilter),
          getCostBreakdown(days, accountId, serviceFilter, tagFilter, groupBy)
        ]);
        
        setTrendData(trendResponse);
        setComparisonData(comparisonResponse);
        setBreakdownData(breakdownResponse);
      } catch (err) {
        console.error('Error fetching cost data:', err);
        setError('Failed to load cost data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, accountId, serviceFilter, tagFilter, groupBy]);
  
  // Helper function to convert time range to days
  const timeRangeToDays = (range) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '6m': return 180;
      case '1y': return 365;
      default: return 30;
    }
  };
  
  // Handle data export
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const days = timeRangeToDays(timeRange);
      await exportCostsCSV(days, accountId, serviceFilter, tagFilter);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Format the title based on applied filters
  const getTitle = () => {
    let title = 'Cost Analysis';
    
    if (serviceFilter) {
      title += ` for ${serviceFilter}`;
    }
    
    if (tagFilter) {
      const [key, value] = tagFilter.split(':');
      title += ` (Tag: ${key}=${value})`;
    }
    
    if (accountId) {
      title += ` - Account #${accountId}`;
    }
    
    return title;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
        
        <button
          type="button"
          onClick={handleExport}
          disabled={exportLoading || loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {exportLoading ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>
      
      {/* Time range selector */}
      <TimeRangeSelector 
        value={timeRange} 
        onChange={setTimeRange} 
      />
      
      {/* Filter bar */}
      <FilterBar 
        accountId={accountId}
        setAccountId={setAccountId}
        serviceFilter={serviceFilter}
        setServiceFilter={setServiceFilter}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />
      
      {/* Error display */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {!loading && !error && (
        <div className="space-y-6">
          {/* Cost trend chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cost Trend
              </h3>
              <div className="mt-2" style={{ height: '300px' }}>
                <CostTrendChart data={trendData} />
              </div>
            </div>
          </div>
          
          {/* Two column charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Cost comparison chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {timeRange === '1y' ? 'Year-over-Year' : timeRange === '7d' ? 'Week-over-Week' : 'Month-over-Month'} Comparison
                </h3>
                <div className="mt-2" style={{ height: '300px' }}>
                  <CostComparisonChart data={comparisonData} timeRange={timeRange} />
                </div>
              </div>
            </div>
            
            {/* Cost breakdown chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cost Breakdown by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                </h3>
                <div className="mt-2" style={{ height: '300px' }}>
                  <CostBreakdownChart data={breakdownData} groupBy={groupBy} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Cost detail table */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cost Details
              </h3>
              <div className="mt-2">
                <ServiceCostTable data={breakdownData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostExplorer;