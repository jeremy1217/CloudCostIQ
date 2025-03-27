// src/services/cloud-accounts.js
import api from './api';

// Get all cloud accounts for the current user
export const getCloudAccounts = async () => {
  try {
    const response = await api.get('/cloud-accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching cloud accounts:', error);
    throw error.response?.data || { detail: 'Failed to fetch cloud accounts' };
  }
};

// Get a specific cloud account by ID
export const getCloudAccount = async (accountId) => {
  try {
    const response = await api.get(`/cloud-accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cloud account:', error);
    throw error.response?.data || { detail: 'Failed to fetch cloud account' };
  }
};

// Create a new cloud account
export const createCloudAccount = async (accountData) => {
  try {
    const response = await api.post('/cloud-accounts', accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating cloud account:', error);
    throw error.response?.data || { detail: 'Failed to create cloud account' };
  }
};

// Update a cloud account
export const updateCloudAccount = async (accountId, accountData) => {
  try {
    const response = await api.put(`/cloud-accounts/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('Error updating cloud account:', error);
    throw error.response?.data || { detail: 'Failed to update cloud account' };
  }
};

// Delete a cloud account
export const deleteCloudAccount = async (accountId) => {
  try {
    const response = await api.delete(`/cloud-accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting cloud account:', error);
    throw error.response?.data || { detail: 'Failed to delete cloud account' };
  }
};

// Test cloud account credentials
export const testCloudAccountCredentials = async (provider, credentials) => {
  try {
    const response = await api.post('/cloud-accounts/test-credentials', {
      provider,
      credentials
    });
    return response.data;
  } catch (error) {
    console.error('Error testing cloud account credentials:', error);
    throw error.response?.data || { detail: 'Failed to test credentials' };
  }
};

// Sync cost data for a specific account
export const syncCloudAccountData = async (accountId) => {
  try {
    const response = await api.post(`/cloud-accounts/${accountId}/sync`);
    return response.data;
  } catch (error) {
    console.error('Error syncing cloud account data:', error);
    throw error.response?.data || { detail: 'Failed to sync account data' };
  }
};