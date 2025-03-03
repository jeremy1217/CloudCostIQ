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

// Generate mock optimization recommendations
const generateMockOptimizationRecommendations = () => {
  const current_recommendations = [
    {
      provider: "AWS",
      service: "EC2",
      suggestion: "Use Reserved Instances to save costs.",
      command: "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type reserved",
      savings: 345.67,
      applied: false
    },
    {
      provider: "Azure",
      service: "VM",
      suggestion: "Resize underutilized virtual machines to optimize costs.",
      command: "az vm resize --resource-group myResourceGroup --name myVM --size Standard_B2s",
      savings: 128.90,
      applied: false
    },
    {
      provider: "AWS",
      service: "S3",
      suggestion: "Configure lifecycle policies to move data to lower-cost storage tiers.",
      command: "aws s3api put-bucket-lifecycle-configuration --bucket my-bucket --lifecycle-configuration file://lifecycle.json",
      savings: 87.45,
      applied: false
    },
    {
      provider: "GCP",
      service: "Compute Engine",
      suggestion: "Enable Committed Use Discounts for stable workloads.",
      command: "gcloud compute commitments create my-commitment --plan 12-month --region us-central1 --resources vcpu=4,memory=16GB",
      savings: 156.78,
      applied: false
    },
    {
      provider: "AWS",
      service: "RDS",
      suggestion: "Delete unused database snapshots.",
      command: "aws rds delete-db-snapshot --db-snapshot-identifier my-snapshot-id",
      savings: 42.35,
      applied: false
    }
  ];

  const past_recommendations = [
    {
      provider: "AWS",
      service: "Lambda",
      suggestion: "Optimize Lambda function memory allocations.",
      command: "aws lambda update-function-configuration --function-name my-function --memory-size 512",
      savings: 18.90,
      applied: true
    },
    {
      provider: "Azure",
      service: "Storage",
      suggestion: "Use Azure Blob lifecycle management for data retention.",
      command: "az storage account management-policy create --account-name myAccount --resource-group myRG --policy @policy.json",
      savings: 32.55,
      applied: true
    }
  ];

  return {
    current_recommendations,
    past_recommendations
  };
};

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
      return generateMockOptimizationRecommendations();
    }
  } catch (error) {
    console.error("Error fetching optimization recommendations:", error);
    // Return mock data as a last resort
    return generateMockOptimizationRecommendations();
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

// Generate mock data for AI features
const generateMockAIStatus = () => {
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
};

// Generate mock combined insights
const generateMockCombinedInsights = (params = {}) => {
  // Calculate dates for historical and forecast data
  const today = new Date();
  const daysToAnalyze = params.days || 30;
  const daysToForecast = params.forecast_days || 14;
  
  // Generate historical data
  const historicalData = [];
  for (let i = daysToAnalyze - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const cost = 100 + (daysToAnalyze - i) * 2 + (Math.random() * 20 - 10);
    historicalData.push({
      date: date.toISOString().split('T')[0],
      cost: parseFloat(cost.toFixed(2))
    });
  }
  
  // Generate forecast data
  const forecastData = [];
  const lastHistoricalCost = historicalData[historicalData.length - 1].cost;
  for (let i = 1; i <= daysToForecast; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const trendFactor = 1 + (i * 0.01);
    const randomFactor = 1 + ((Math.random() * 0.1) - 0.05);
    const predictedCost = lastHistoricalCost * trendFactor * randomFactor;
    const uncertaintyFactor = 0.05 + (i * 0.005);
    
    forecastData.push({
      date: date.toISOString().split('T')[0],
      predicted_cost: parseFloat(predictedCost.toFixed(2)),
      lower_bound: parseFloat((predictedCost * (1 - uncertaintyFactor)).toFixed(2)),
      upper_bound: parseFloat((predictedCost * (1 + uncertaintyFactor)).toFixed(2))
    });
  }
  
  // Generate anomalies
  const anomalies = [
    {
      date: '2025-02-25',
      service: 'EC2',
      cost: 250.75,
      baseline_cost: 150.25,
      cost_difference: 100.50,
      anomaly_score: 3.2,
      root_cause: {
        primary_cause: 'Increase in running instances or workload spikes.'
      }
    },
    {
      date: '2025-02-28',
      service: 'S3',
      cost: 180.40,
      baseline_cost: 90.20,
      cost_difference: 90.20,
      anomaly_score: 2.8,
      root_cause: {
        primary_cause: 'High data transfer or increased storage consumption.'
      }
    }
  ];
  
  // Get recommendations from our existing mock function
  const optimizationData = generateMockOptimizationRecommendations();
  
  // Calculate total costs and savings
  const totalHistoricalCost = historicalData.reduce((sum, item) => sum + item.cost, 0);
  const totalForecastCost = forecastData.reduce((sum, item) => sum + item.predicted_cost, 0);
  const totalPotentialSavings = optimizationData.current_recommendations.reduce(
    (sum, rec) => sum + (rec.savings || 0), 0
  );
  
  return {
    summary: {
      total_cost: parseFloat(totalHistoricalCost.toFixed(2)),
      forecast_total: parseFloat(totalForecastCost.toFixed(2)),
      anomaly_count: anomalies.length,
      potential_savings: parseFloat(totalPotentialSavings.toFixed(2)),
      days_analyzed: daysToAnalyze,
      days_forecasted: daysToForecast
    },
    forecast: forecastData,
    anomalies: anomalies,
    optimizations: optimizationData.current_recommendations,
    ai_metadata: {
      forecast_algorithm: 'ensemble',
      anomaly_method: 'isolation_forest',
      optimization_categories: 5
    }
  };
};

// AI Dashboard API functions
export const getAIStatus = async () => {
  try {
    const response = await apiClient.get("/ai/status");
    return response.data;
  } catch (error) {
    console.log("Using mock AI status data");
    return generateMockAIStatus();
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
        ...generateMockAIStatus(),
        enhanced_ai_enabled: enableEnhanced
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
    const insights = generateMockCombinedInsights({
      days: 30,
      forecast_days: params.days_ahead || 7
    });
    return {
      forecast: insights.forecast,
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
    const insights = generateMockCombinedInsights();
    return {
      anomalies: insights.anomalies,
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
    return generateMockCombinedInsights(params);
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
  ingestCostData,
  getAIStatus,
  configureAI,
  generateForecast,
  detectAnomalies,
  getCombinedInsights
};

export default api