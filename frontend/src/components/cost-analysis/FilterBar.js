// src/components/cost-analysis/FilterBar.js
import React, { useState, useEffect } from 'react';
import { getCloudAccounts } from '../../services/cloud-accounts';
import { getAvailableServices, getAvailableTags } from '../../services/cost-analysis';

const FilterBar = ({ 
  accountId, 
  setAccountId, 
  serviceFilter, 
  setServiceFilter, 
  tagFilter, 
  setTagFilter, 
  groupBy, 
  setGroupBy 
}) => {
  const [accounts, setAccounts] = useState([]);
  const [services, setServices] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Group by options
  const groupByOptions = [
    { value: 'service', label: 'Service' },
    { value: 'account', label: 'Account' },
    { value: 'region', label: 'Region' },
    { value: 'tag', label: 'Tag' }
  ];
  
  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      try {
        // Fetch accounts
        const accountsData = await getCloudAccounts();
        setAccounts(accountsData);
        
        // Fetch services and tags
        const servicesData = await getAvailableServices(accountId);
        const tagsData = await getAvailableTags(accountId);
        
        setServices(servicesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterOptions();
  }, [accountId]);
  
  // Handle account change
  const handleAccountChange = (e) => {
    setAccountId(e.target.value);
    // Reset other filters when account changes
    setServiceFilter('');
    setTagFilter('');
  };
  
  return (
    <div className="mt-4 bg-white p-4 shadow rounded-lg">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {/* Account filter */}
        <div>
          <label htmlFor="account-filter" className="block text-sm font-medium text-gray-700">
            Cloud Account
          </label>
          <select
            id="account-filter"
            name="account-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={accountId}
            onChange={handleAccountChange}
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.provider})
              </option>
            ))}
          </select>
        </div>
        
        {/* Service filter */}
        <div>
          <label htmlFor="service-filter" className="block text-sm font-medium text-gray-700">
            Service
          </label>
          <select
            id="service-filter"
            name="service-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">All Services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tag filter */}
        <div>
          <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700">
            Tag
          </label>
          <select
            id="tag-filter"
            name="tag-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">No Tag Filter</option>
            {tags.map((tag) => (
              <option key={tag.key + tag.value} value={`${tag.key}:${tag.value}`}>
                {tag.key}: {tag.value}
              </option>
            ))}
          </select>
        </div>
        
        {/* Group by selector */}
        <div>
          <label htmlFor="group-by" className="block text-sm font-medium text-gray-700">
            Group By
          </label>
          <select
            id="group-by"
            name="group-by"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            {groupByOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;