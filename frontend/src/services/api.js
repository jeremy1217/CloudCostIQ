import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000 // 10 second timeout
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        message: "Unable to connect to the server. Please check your internet connection."
      });
    }
    
    // Handle API errors
    console.error("API Error:", error.response?.data || error);
    
    return Promise.reject(error.response?.data || error);
  }
);

// Cost data API functions
export const getCloudCosts = async () => {
  try {
    const response = await apiClient.get("/costs/mock-costs");
    return response.data;
  } catch (error) {
    console.error("Error fetching cloud costs:", error);
    return [];
  }
};

export const getCostBreakdown = async () => {
  try {
    const response = await apiClient.get("/insights/cost-breakdown");
    return response.data.cost_breakdown || [];
  } catch (error) {
    console.error("Error fetching cost breakdown:", error);
    return [];
  }
};

// AI insights API functions
export const getCostPredictions = async (data = {}) => {
  try {
    const response = await apiClient.get("/forecasting/predict", { params: data });
    return response.data;
  } catch (error) {
    console.error("Error fetching cost predictions:", error);
    return { historical_data: [], forecast_data: [] };
  }
};

export const getAnomalyDetection = async (data = {}) => {
  try {
    const response = await apiClient.get("/anomalies/detect", { params: data });
    return response.data.anomalies || [];
  } catch (error) {
    console.error("Error detecting cost anomalies:", error);
    return [];
  }
};

export const getCostAttribution = async (attributionType = 'team', timeRange = 'month') => {
  try {
    const response = await apiClient.get(`/attribution/by-${attributionType}`, { 
      params: { time_range: timeRange } 
    });
    return response.data.attribution || [];
  } catch (error) {
    console.error("Error fetching cost attribution:", error);
    return [];
  }
};

export const getUntaggedResources = async () => {
  try {
    const response = await apiClient.get("/attribution/untagged");
    return response.data.untagged_resources || [];
  } catch (error) {
    console.error("Error fetching untagged resources:", error);
    return [];
  }
};

// Optimization API functions
export const getOptimizationRecommendations = async () => {
  try {
    const response = await apiClient.get("/optimize/recommendations");
    return response.data;
  } catch (error) {
    console.error("Error fetching optimization recommendations:", error);
    return {
      current_recommendations: [],
      past_recommendations: []
    };
  }
};

export const applyOptimization = async (provider, service) => {
  try {
    const response = await apiClient.post("/optimize/apply", { provider, service });
    return response.data;
  } catch (error) {
    console.error("Error applying optimization:", error);
    throw new Error("Failed to apply optimization");
  }
};

// Data ingestion function
export const ingestCostData = async () => {
  try {
    const response = await apiClient.get("/costs/ingest");
    return response.data;
  } catch (error) {
    console.error("Error ingesting cost data:", error);
    throw new Error("Failed to ingest cost data");
  }
};

// A default export of all functions
const api = {
  getCloudCosts,
  getCostBreakdown,
  getCostPredictions,
  getAnomalyDetection,
  getCostAttribution,
  getUntaggedResources,
  getOptimizationRecommendations,
  applyOptimization,
  ingestCostData
};

export default api;