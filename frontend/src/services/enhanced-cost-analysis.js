// src/services/enhanced-cost-analysis.js
import api from './api';

// Get enhanced anomalies
export const getEnhancedAnomalies = async (days = 30, sensitivity = 2.0, methods = null) => {
  try {
    let params = { days, sensitivity };

    // Add detection methods if specified
    if (methods) {
      params.methods = methods.join(',');
    }
    
    const response = await api.get('/costs/enhanced/anomalies/enhanced', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching enhanced anomalies:', error);
    throw error.response?.data || { detail: 'Failed to fetch enhanced anomalies' };
  }
};

// Get contextual anomalies
export const getContextualAnomalies = async (days = 30, accountId = null) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/enhanced/anomalies/contextual', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching contextual anomalies:', error);
    throw error.response?.data || { detail: 'Failed to fetch contextual anomalies' };
  }
};

// Get enhanced recommendations
export const getEnhancedRecommendations = async (accountId = null) => {
  try {
    const params = {};
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/enhanced/recommendations/enhanced', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching enhanced recommendations:', error);
    throw error.response?.data || { detail: 'Failed to fetch enhanced recommendations' };
  }
};

// Get storage optimization recommendations
export const getStorageOptimizationRecommendations = async (accountId = null, days = 30) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/enhanced/recommendations/storage', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching storage recommendations:', error);
    throw error.response?.data || { detail: 'Failed to fetch storage recommendations' };
  }
};

// Get network optimization recommendations
export const getNetworkOptimizationRecommendations = async (accountId = null, days = 30) => {
  try {
    const params = { days };
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/enhanced/recommendations/network', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching network recommendations:', error);
    throw error.response?.data || { detail: 'Failed to fetch network recommendations' };
  }
};

// Get top recommendations
export const getTopRecommendations = async (accountId = null, limit = 10) => {
  try {
    const params = { limit };
    if (accountId) params.account_id = accountId;
    
    const response = await api.get('/costs/enhanced/top-recommendations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top recommendations:', error);
    throw error.response?.data || { detail: 'Failed to fetch top recommendations' };
  }
};