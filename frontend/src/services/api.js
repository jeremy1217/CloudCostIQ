import axios from "axios";
import { API_BASE_URL } from '../config';
import {
  getMockHistoricalCostData,
  getMockForecastData,
  getMockAnomalyData,
  getMockCostAttributionData,
  getMockUntaggedResourcesData,
  getMockOptimizationRecommendations,
  getMockCombinedInsights
} from "./mockData";

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

// Create the API object with all functions
const api = {
  // Export the axios instance for direct use
  client: apiClient,

  // Cost data API functions
  getCloudCosts: async () => {
    try {
      // First try to get real data from API
      try {
        const response = await apiClient.get("/api/costs/mock-costs");
        
        // The backend already returns data in the correct format
        return {
          costs: response.data.costs,
          total_cost: response.data.total_cost,
          date_range: response.data.date_range
        };
      } catch (apiError) {
        console.log("Using mock cloud costs data");
        // Fall back to mock data with proper structure
        const mockData = [
          { provider: "AWS", service: "EC2", cost: 120.50, date: new Date().toISOString().split('T')[0] },
          { provider: "AWS", service: "S3", cost: 65.30, date: new Date().toISOString().split('T')[0] },
          { provider: "AWS", service: "RDS", cost: 110.45, date: new Date().toISOString().split('T')[0] },
          { provider: "Azure", service: "VM", cost: 98.75, date: new Date().toISOString().split('T')[0] },
          { provider: "GCP", service: "Compute Engine", cost: 85.20, date: new Date().toISOString().split('T')[0] }
        ];

        return {
          costs: mockData,
          total_cost: mockData.reduce((sum, item) => sum + item.cost, 0),
          date_range: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        };
      }
    } catch (error) {
      console.error("Error fetching cloud costs:", error);
      return { costs: [], total_cost: 0, date_range: { start: null, end: null } };
    }
  },

  getCostBreakdown: async () => {
    try {
      // First try to get real data from API
      try {
        const response = await apiClient.post("/multi-cloud/service-cost-breakdown", {
          providers: ["AWS", "GCP", "Azure"],
          timeRange: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            granularity: "MONTHLY"
          }
        });
        
        // Transform the data to match the expected format
        const transformedData = [];
        response.data.serviceBreakdown.forEach(item => {
          Object.entries(item.providerCosts).forEach(([provider, cost]) => {
            transformedData.push({
              provider,
              service: item.service,
              cost: cost
            });
          });
        });
        return transformedData;
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
  },

  // AI insights API functions
  getCostPredictions: async (data = {}) => {
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
  },

  getAnomalyDetection: async (data = {}) => {
    try {
      const response = await apiClient.get("/anomalies/detect", { params: data });
      return response.data.anomalies || [];
    } catch (error) {
      console.error("Error detecting cost anomalies:", error);
      // Use mock data as fallback
      return getMockAnomalyData();
    }
  },

  getCostAttribution: async (attributionType = 'team', timeRange = 'month') => {
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
  },

  getUntaggedResources: async () => {
    try {
      const response = await apiClient.get("/attribution/untagged");
      return response.data.untagged_resources || [];
    } catch (error) {
      console.error("Error fetching untagged resources:", error);
      // Use mock data as fallback
      return getMockUntaggedResourcesData();
    }
  },

  // Optimization API functions
  getOptimizationRecommendations: async () => {
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
  },

  applyOptimization: async (provider, service) => {
    try {
      const response = await apiClient.post("/optimize/apply", { provider, service });
      return response.data;
    } catch (error) {
      console.error("Error applying optimization:", error);
      throw new Error("Failed to apply optimization");
    }
  },

  // Data ingestion function
  ingestCostData: async () => {
    try {
      const response = await apiClient.get("/costs/ingest");
      return response.data;
    } catch (error) {
      console.error("Error ingesting cost data:", error);
      throw new Error("Failed to ingest cost data");
    }
  },

  // AI Dashboard API functions
  getAIStatus: async () => {
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
  },

  configureAI: async (enableEnhanced) => {
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
  },

  generateForecast: async (params = {}) => {
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
  },

  detectAnomalies: async (params = {}) => {
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
  },

  getCombinedInsights: async (params = {}) => {
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
  },

  // Multi-Cloud Comparison API functions
  getProviderComparison: async () => {
    try {
      const response = await apiClient.get("/multi-cloud/comparison");
      return response.data;
    } catch (error) {
      console.error("Error fetching provider comparison:", error);
      throw error;
    }
  },

  getMigrationAnalysis: async (sourceProvider, targetProvider) => {
    try {
      const response = await apiClient.post("/multi-cloud/migration-analysis", {
        source_provider: sourceProvider,
        target_provider: targetProvider
      });
      return response.data;
    } catch (error) {
      console.error("Error analyzing migration:", error);
      throw error;
    }
  },

  getCrossCloudOptimizations: async () => {
    try {
      const response = await apiClient.get('/multi-cloud/optimizations');
      return response.data;
    } catch (error) {
      console.error('Error fetching cross-cloud optimizations:', error);
      // Mock data fallback would go here
      return [];
    }
  },

  generateMigrationPlan: async (sourceProvider, targetProvider, options = {}) => {
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
  },

  getServiceMapping: async () => {
    try {
      const response = await apiClient.get("/multi-cloud/service-mapping");
      return response.data;
    } catch (error) {
      console.error("Error fetching service mapping:", error);
      return [];
    }
  },

  getOptimizationOpportunities: async () => {
    try {
      const response = await apiClient.get("/multi-cloud/optimizations");
      return response.data;
    } catch (error) {
      console.error("Error fetching optimization opportunities:", error);
      return null;
    }
  },

  // Cloud resources API functions
  getCloudResourcesData: async () => {
    try {
      const response = await apiClient.get("/api/resources");
      return response.data;
    } catch (error) {
      console.error("Error fetching cloud resources data:", error);
      // Return mock data for development
      return {
        resources: [
          {
            id: "i-abc123",
            provider: "AWS",
            service: "EC2",
            resource_type: "Instance",
            name: "web-server-1",
            status: "running",
            cost: 120.50
          },
          {
            id: "vol-xyz789",
            provider: "AWS",
            service: "EBS",
            resource_type: "Volume",
            name: "data-volume-1",
            status: "in-use",
            cost: 45.30
          },
          {
            id: "s3-bucket-123",
            provider: "AWS",
            service: "S3",
            resource_type: "Bucket",
            name: "data-storage",
            status: "active",
            cost: 25.75
          }
        ]
      };
    }
  }
};

// Export the API object as default
export default api;