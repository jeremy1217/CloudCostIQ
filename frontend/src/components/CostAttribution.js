import axios from "axios";
import {
  getMockHistoricalCostData,
  getMockForecastData,
  getMockAnomalyData,
  getMockCostAttributionData,
  getMockUntaggedResourcesData,
  getMockOptimizationRecommendations,
  getMockCombinedInsights
} from "../services/mockData";

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
    // First try to get real data from API
    try {
      const response = await apiClient.get("/costs/mock-costs");
      return response.data;
    } catch (apiError) {
      console.log("Using mock cloud costs data");
      // Fall back to mock data
      return [
        { provider: "AWS", service: "EC2", cost: 120.50, date: "2025-02-20" },
        { provider: "Azure", service: "VM", cost: 98.75, date: "2025-02-21" },
        { provider: "GCP", service: "Compute Engine", cost: 85.20, date: "2025-02-22" },
        { provider: "AWS", service: "S3", cost: 65.30, date: "2025-02-23" },
        { provider: "AWS", service: "RDS", cost: 110.45, date: "2025-02-24" }
      ];
    }
  } catch (error) {
    console.error("Error fetching cloud costs:", error);
    return [];
  }
};

export const getCostBreakdown = async () => {
  try {
    // First try to get real data from API
    try {
      const response = await apiClient.get("/insights/cost-breakdown");
      return response.data.cost_breakdown || [];
    } catch (apiError) {
      console.log("Using mock cost breakdown data");
      // Fall back to mock data
      return [
        { provider: "AWS", service: "EC2", cost: 120.50 },
        { provider: "Azure", service: "VM", cost: 98.75 },
        { provider: "GCP", service: "Compute Engine", cost: 85.20 },
        { provider: "AWS", service: "S3", cost: 65.30 },
        { provider: "AWS", service: "RDS", cost: 110.45 }
      ];
    }
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
    // Use mock data as fallback
    const historicalData = getMockHistoricalCostData(30);
    const forecastData = getMockForecastData(historicalData, 14);
    return { historical_data: historicalData, forecast_data: forecastData };
  }
};

export const getAnomalyDetection = async (data = {}) => {
  try {
    const response = await apiClient.get("/anomalies/detect", { params: data });
    return response.data.anomalies || [];
  } catch (error) {
    console.error("Error detecting cost anomalies:", error);
    // Use mock data as fallback
    return getMockAnomalyData();
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
    // Use mock data as fallback
    return getMockCostAttributionData(attributionType);
  }
};

export const getUntaggedResources = async () => {
  try {
    const response = await apiClient.get("/attribution/untagged");
    return response.data.untagged_resources || [];
  } catch (error) {
    console.error("Error fetching untagged resources:", error);
    // Use mock data as fallback
    return getMockUntaggedResourcesData();
  }
};

// Optimization API functions
export const getOptimizationRecommendations = async () => {
  try {
    try {
      const response = await apiClient.get("/optimize/recommendations");
      
      // If the response doesn't contain recommendations, throw an error to trigger the fallback
      if (!response.data || !response.data.current_recommendations || response.data.current_recommendations.length === 0) {
        throw new Error("No recommendations found in API response");
      }
      
      return response.data;
    } catch (apiError) {
      console.log("Using mock optimization recommendations data");
      // Fall back to mock data
      return getMockOptimizationRecommendations();
    }
  } catch (error) {
    console.error("Error fetching optimization recommendations:", error);
    // Return mock data as a last resort
    return getMockOptimizationRecommendations();
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

// AI Dashboard API functions
export const getAIStatus = async () => {
  try {
    const response = await apiClient.get("/ai/status");
    return response.data;
  } catch (error) {
    console.log("Using mock AI status data");
    // Return mock AI status
    return {
      enhanced_ai_enabled: true,
      capabilities: {
        forecasting: {
          algorithms: ["linear", "arima", "exp_smoothing", "random_forest", "auto"],
          max_forecast_days: 365,
          min_data_points: 5
        },
        anomaly_detection: {
          methods: ["zscore", "isolation_forest", "dbscan", "seasonal_decompose", "ensemble"],
          root_cause_analysis: true
        },
        optimization: {
          categories: [
            "instance_rightsizing",
            "reserved_instances",
            "storage_optimization",
            "idle_resources",
            "licensing_optimization"
          ]
        }
      },
      version: "1.0.0",
      last_updated: "2025-03-02"
    };
  }
};

export const configureAI = async (enableEnhanced) => {
  try {
    const response = await apiClient.post("/ai/config", {
      enable_enhanced_ai: enableEnhanced
    });
    return response.data;
  } catch (error) {
    console.log("Using mock AI config response");
    return {
      message: `Enhanced AI capabilities ${enableEnhanced ? 'enabled' : 'disabled'}`,
      status: {
        enhanced_ai_enabled: enableEnhanced,
        capabilities: {
          forecasting: {
            algorithms: ["linear", "arima", "exp_smoothing", "random_forest", "auto"],
            max_forecast_days: 365,
            min_data_points: 5
          },
          anomaly_detection: {
            methods: ["zscore", "isolation_forest", "dbscan", "seasonal_decompose", "ensemble"],
            root_cause_analysis: true
          }
        }
      }
    };
  }
};

export const generateForecast = async (params = {}) => {
  try {
    const response = await apiClient.post("/ai/forecast", {
      service: params.service,
      days_ahead: params.days_ahead || 7,
      algorithm: params.algorithm || "auto"
    });
    return response.data;
  } catch (error) {
    console.log("Using mock forecast data");
    // Use mock data as fallback
    const historicalData = getMockHistoricalCostData(30);
    const forecastData = getMockForecastData(historicalData, params.days_ahead || 7);
    
    return {
      forecast: forecastData,
      algorithm_used: params.algorithm || "auto",
      algorithm_name: "Ensemble Method",
      data_points_used: 30,
      request: params
    };
  }
};

export const detectAnomalies = async (params = {}) => {
  try {
    const response = await apiClient.post("/ai/anomalies", {
      service: params.service,
      threshold: params.threshold || 2.0,
      method: params.method || "ensemble",
      analyze_root_cause: params.analyze_root_cause !== false,
      days: params.days || 30
    });
    return response.data;
  } catch (error) {
    console.log("Using mock anomaly data");
    // Use mock data as fallback
    return {
      anomalies: getMockAnomalyData(),
      detection_method: params.method || "ensemble",
      method_name: "Ensemble Method",
      threshold: params.threshold || 2.0,
      data_points: 30,
      request: params
    };
  }
};

export const getCombinedInsights = async (params = {}) => {
  try {
    const response = await apiClient.get("/ai/combined-insights", {
      params: {
        days: params.days || 30,
        forecast_days: params.forecast_days || 14
      }
    });
    return response.data;
  } catch (error) {
    console.log("Using mock combined insights data");
    // Use mock data as fallback
    return getMockCombinedInsights(params);
  }
};

// Multi-Cloud Comparison API functions
export const getProviderComparison = async (timeRange = 'month', serviceCategory = 'all') => {
  try {
    const response = await apiClient.get('/multi-cloud/comparison', {
      params: { timeRange, serviceCategory }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching provider comparison:', error);
    // For demo, fallback to mock data
    return {
      serviceComparison: [
        {
          serviceCategory: "Compute",
          awsCost: 4500,
          gcpCost: 3800,
          azureCost: 4200
        },
        {
          serviceCategory: "Storage",
          awsCost: 2100,
          gcpCost: 2300,
          azureCost: 1900
        },
        {
          serviceCategory: "Database",
          awsCost: 1800,
          gcpCost: 1600,
          azureCost: 1900
        },
        {
          serviceCategory: "Networking",
          awsCost: 1300,
          gcpCost: 1000,
          azureCost: 1300
        }
      ],
      totalCosts: {
        aws: 9700,
        gcp: 8700,
        azure: 9300
      },
      lowestCostProvider: "GCP",
      potentialSavings: 1000,
      potentialAnnualSavings: 12000
    };
  }
};

export const getMigrationAnalysis = async (sourceProvider = 'AWS', targetProvider = 'Azure') => {
  try {
    const response = await apiClient.get('/multi-cloud/migration-analysis', {
      params: { sourceProvider, targetProvider }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching migration analysis:', error);
    // Mock data fallback would go here
    return {};
  }
};

export const getCrossCloudOptimizations = async () => {
  try {
    const response = await apiClient.get('/multi-cloud/optimizations');
    return response.data;
  } catch (error) {
    console.error('Error fetching cross-cloud optimizations:', error);
    // Mock data fallback would go here
    return [];
  }
};

export const generateMigrationPlan = async (sourceProvider, targetProvider, options = {}) => {
  try {
    const response = await apiClient.post('/multi-cloud/migration-plan', {
      sourceProvider,
      targetProvider,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error generating migration plan:', error);
    throw new Error('Failed to generate migration plan');
  }
};

export const getServiceMapping = async (sourceProvider, targetProvider) => {
  try {
    const response = await apiClient.get('/multi-cloud/service-mapping', {
      params: { sourceProvider, targetProvider }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service mapping:', error);
    return [];
  }
};

// Update the default export to include the new functions
const api = {
  // Cost data functions
  getCloudCosts,
  getCostBreakdown,
  
  // AI insights functions
  getCostPredictions,
  getAnomalyDetection,
  getCostAttribution,
  getUntaggedResources,
  
  // Optimization functions
  getOptimizationRecommendations,
  applyOptimization,
  
  // Data management functions
  ingestCostData,
  
  // AI Dashboard functions
  getAIStatus,
  configureAI,
  generateForecast,
  detectAnomalies,
  getCombinedInsights,
  
  // Multi-cloud functions
  getProviderComparison,
  getMigrationAnalysis,
  getCrossCloudOptimizations,
  generateMigrationPlan,
  getServiceMapping
};

export default api;