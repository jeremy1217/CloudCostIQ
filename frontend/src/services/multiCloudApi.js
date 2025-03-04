import axios from 'axios';

// Define API base URL directly
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/multi-cloud`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor for authentication tokens
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const multiCloudApi = {
  // Get cost comparison between cloud providers
  getProviderComparison: async () => {
    try {
      return await apiClient.get('/comparison');
    } catch (error) {
      console.error('Error fetching provider comparison:', error);
      throw error;
    }
  },

  // Get service mapping between providers
  getServiceMapping: async () => {
    try {
      return await apiClient.get('/service-mapping');
    } catch (error) {
      console.error('Error fetching service mapping:', error);
      throw error;
    }
  },

  // Get migration analysis between providers
  getMigrationAnalysis: async (sourceProvider, targetProvider, resources) => {
    try {
      return await apiClient.post('/migration-analysis', {
        sourceProvider,
        targetProvider,
        resources
      });
    } catch (error) {
      console.error('Error fetching migration analysis:', error);
      throw error;
    }
  },

  // Generate migration plan
  getMigrationPlan: async (sourceProvider, targetProvider, resources) => {
    try {
      return await apiClient.post('/migration-plan', {
        sourceProvider,
        targetProvider,
        resources
      });
    } catch (error) {
      console.error('Error generating migration plan:', error);
      throw error;
    }
  },

  // Get cross-cloud optimization opportunities
  getOptimizations: async () => {
    try {
      return await apiClient.get('/optimizations');
    } catch (error) {
      console.error('Error fetching optimization opportunities:', error);
      throw error;
    }
  },

  // Get optimization details for a specific opportunity
  getOptimizationDetails: async (opportunityId) => {
    try {
      return await apiClient.get(`/optimizations/${opportunityId}`);
    } catch (error) {
      console.error('Error fetching optimization details:', error);
      throw error;
    }
  },

  // Get provider-specific cost details
  getProviderCostDetails: async (provider, timeRange) => {
    try {
      return await apiClient.get(`/provider-costs/${provider}`, {
        params: timeRange
      });
    } catch (error) {
      console.error(`Error fetching ${provider} cost details:`, error);
      throw error;
    }
  },

  // Get detailed cost breakdown by service
  getServiceCostBreakdown: async (providers, timeRange) => {
    try {
      return await apiClient.post('/service-cost-breakdown', {
        providers,
        timeRange
      });
    } catch (error) {
      console.error('Error fetching service cost breakdown:', error);
      throw error;
    }
  },

  // Generate optimization report
  generateOptimizationReport: async (format = 'pdf') => {
    try {
      return await apiClient.get('/generate-optimization-report', {
        params: { format },
        responseType: 'blob'
      });
    } catch (error) {
      console.error('Error generating optimization report:', error);
      throw error;
    }
  },

  // Apply optimization plan
  applyOptimizationPlan: async (optimizationIds) => {
    try {
      return await apiClient.post('/apply-optimization', {
        optimizationIds
      });
    } catch (error) {
      console.error('Error applying optimization plan:', error);
      throw error;
    }
  }
};

export default multiCloudApi;