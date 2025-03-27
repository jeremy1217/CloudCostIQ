// src/services/cost-analysis.js
import api from './api';

// Get cost trend data for time series analysis
export const getCostTrend = async (days = 30, accountId = null, service = null, tag = null) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    if (service) params.service = service;
    if (tag) params.tag = tag;
    
    const response = await api.get('/costs/trend', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cost trend:', error);
    throw error.response?.data || { detail: 'Failed to fetch cost trend data' };
  }
};

// Get cost comparison data (month-over-month, year-over-year)
export const getCostComparison = async (days = 30, accountId = null, service = null, tag = null) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    if (service) params.service = service;
    if (tag) params.tag = tag;
    
    const response = await api.get('/costs/comparison', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cost comparison:', error);
    throw error.response?.data || { detail: 'Failed to fetch cost comparison data' };
  }
};

// Get cost breakdown data (by service, account, region, or tag)
export const getCostBreakdown = async (days = 30, accountId = null, service = null, tag = null, groupBy = 'service') => {
  try {
    const params = { days, group_by: groupBy };
    if (accountId) params.account_id = accountId;
    if (service) params.service = service;
    if (tag) params.tag = tag;
    
    const response = await api.get('/costs/breakdown', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cost breakdown:', error);
    throw error.response?.data || { detail: 'Failed to fetch cost breakdown data' };
  }
};

// Get daily cost data
export const getDailyCosts = async (days = 30, accountId = null, service = null, tag = null) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    if (service) params.service = service;
    if (tag) params.tag = tag;
    
    const response = await api.get('/costs/daily', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily costs:', error);
    throw error.response?.data || { detail: 'Failed to fetch daily cost data' };
  }
};

// Get available services for filtering
export const getAvailableServices = async (accountId = null) => {
  try {
    const params = {};
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/services', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching available services:', error);
    throw error.response?.data || { detail: 'Failed to fetch available services' };
  }
};

// Get available tags for filtering
export const getAvailableTags = async (accountId = null) => {
  try {
    const params = {};
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/tags', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching available tags:', error);
    throw error.response?.data || { detail: 'Failed to fetch available tags' };
  }
};

// Export all costs data as CSV
export const exportCostsCSV = async (days = 30, accountId = null, service = null, tag = null) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    if (service) params.service = service;
    if (tag) params.tag = tag;
    
    const response = await api.get('/costs/export', { 
      params,
      responseType: 'blob'
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cloud-costs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting costs data:', error);
    throw error.response?.data || { detail: 'Failed to export cost data' };
  }
};