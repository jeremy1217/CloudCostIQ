import axios from 'axios';
import { API_BASE_URL } from '../config';

const planService = {
    // Get all available plans
    getPlans: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/plans`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch plans');
        }
    },

    // Get current user's plan
    getCurrentPlan: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/plans/current`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null; // No active subscription
            }
            throw new Error(error.response?.data?.detail || 'Failed to fetch current plan');
        }
    },

    // Subscribe to a plan
    subscribeToPlan: async (planName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/plans/${planName}/subscribe`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to subscribe to plan');
        }
    },

    // Cancel subscription
    cancelSubscription: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/plans/cancel`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to cancel subscription');
        }
    },

    // Check if a feature is available in the current plan
    checkFeatureAccess: async (featureName) => {
        try {
            const currentPlan = await planService.getCurrentPlan();
            if (!currentPlan) return false;
            return currentPlan.features[featureName] || false;
        } catch (error) {
            console.error('Error checking feature access:', error);
            return false;
        }
    },

    // Get the number of remaining cloud accounts that can be added
    getRemainingCloudAccounts: async () => {
        try {
            const currentPlan = await planService.getCurrentPlan();
            if (!currentPlan) return 0;
            
            // -1 means unlimited
            if (currentPlan.max_cloud_accounts === -1) return Infinity;
            
            // Get current cloud accounts count from the user profile or another endpoint
            const userProfile = await axios.get(`${API_BASE_URL}/users/me`);
            const currentCount = userProfile.data.api_keys?.length || 0;
            
            return Math.max(0, currentPlan.max_cloud_accounts - currentCount);
        } catch (error) {
            console.error('Error checking remaining cloud accounts:', error);
            return 0;
        }
    }
};

export default planService; 