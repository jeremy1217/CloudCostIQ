import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error
    console.error("API Error:", error);
    
    // You could also add toast notifications here
    
    return Promise.reject(error);
  }
);

// Export API functions using the configured client
export const getCloudCosts = async () => {
  try {
    const response = await apiClient.get("/costs/mock-costs");
    return response.data;
  } catch (error) {
    return [];
  }
};

// Get AI-powered cost predictions
export const getCostPredictions = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/insights/predict`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching cost predictions:", error);
        return null;
    }
};

// Detect cost anomalies
export const getAnomalyDetection = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/insights/anomaly`, data);
        return response.data;
    } catch (error) {
        console.error("Error detecting cost anomalies:", error);
        return null;
    }
};

// Get cost optimization recommendations
export const getOptimizationRecommendations = async () => {
    try {
        const response = await axios.get(`${API_URL}/actions/optimize`);
        return response.data;
    } catch (error) {
        console.error("Error fetching optimization recommendations:", error);
        return [];
    }
};
