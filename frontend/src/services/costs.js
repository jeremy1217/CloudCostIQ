// src/services/costs.js
import api from './api';

export const getCostSummary = async (accountId = null, days = 30) => {
  try {
    const params = { days };
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/summary', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch cost summary' };
  }
};

export const getCostsByService = async (accountId = null, days = 30) => {
  try {
    const params = { days };
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/by-service', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch costs by service' };
  }
};

export const getCostAnomalies = async (accountId = null, days = 30, sensitivity = 2.0) => {
  try {
    const params = { days, sensitivity };
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/anomalies', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch cost anomalies' };
  }
};

export const getIdleResources = async (accountId = null, days = 30) => {
  try {
    const params = { days };
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/idle-resources', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch idle resources' };
  }
};

export const getRightsizingRecommendations = async (accountId = null, days = 30) => {
  try {
    const params = { days };
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/rightsizing', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch rightsizing recommendations' };
  }
};

export const getReservedInstanceRecommendations = async (accountId = null, days = 90) => {
  try {
    const params = { days };
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/reserved-instances', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch reserved instance recommendations' };
  }
};

export const getAllRecommendations = async (accountId = null) => {
  try {
    const params = {};
    if (accountId) {
      params.account_id = accountId;
    }
    
    const response = await api.get('/costs/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: 'Failed to fetch recommendations' };
  }
};