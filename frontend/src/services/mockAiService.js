// Same content as before, just renamed the file to mockAiService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000 // 15 second timeout for AI operations which might take longer
});

// Helper function to generate dummy data
function generateDummyData() {
  const today = new Date();
  const historical_data = [];
  
  // Generate 30 days of historical data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Base cost with some random variation and a slight upward trend
    const cost = 100 + (30 - i) * 2 + (Math.random() * 20 - 10);
    
    historical_data.push({
      date: date.toISOString().split('T')[0],
      cost: parseFloat(cost.toFixed(2))
    });
  }
  
  // Generate forecast data for next 14 days
  const forecast = [];
  const lastHistoricalCost = historical_data[historical_data.length - 1].cost;
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Forecast with a slight upward trend and uncertainty that increases with time
    const trendFactor = 1 + (i * 0.01);  // 1% increase per day
    const randomFactor = 1 + ((Math.random() * 0.1) - 0.05);  // ±5% random variation
    const predicted_cost = lastHistoricalCost * trendFactor * randomFactor;
    
    // Uncertainty increases with time
    const uncertaintyFactor = 0.05 + (i * 0.005);  // Starts at 5% and increases
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted_cost: parseFloat(predicted_cost.toFixed(2)),
      lower_bound: parseFloat((predicted_cost * (1 - uncertaintyFactor)).toFixed(2)),
      upper_bound: parseFloat((predicted_cost * (1 + uncertaintyFactor)).toFixed(2))
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
    },
    {
      date: '2025-03-01',
      service: 'RDS',
      cost: 210.30,
      baseline_cost: 130.15,
      cost_difference: 80.15,
      anomaly_score: 2.5,
      root_cause: {
        primary_cause: 'Unexpected database queries or connection spikes.'
      }
    }
  ];
  
  // Generate optimization recommendations
  const optimizations = [
    {
      id: 'opt-1',
      title: 'EC2 Instance Rightsizing',
      service: 'EC2',
      category: 'instance_rightsizing',
      description: 'Resize overprovisioned EC2 instances to match actual workload requirements.',
      estimated_savings: 120.50,
      savings_percentage: 25,
      implementation_effort: 'medium'
    },
    {
      id: 'opt-2',
      title: 'Reserved Instance Opportunities',
      service: 'EC2',
      category: 'reserved_instances',
      description: 'Purchase reserved instances for consistently running workloads.',
      estimated_savings: 230.75,
      savings_percentage: 35,
      implementation_effort: 'low'
    },
    {
      id: 'opt-3',
      title: 'S3 Storage Class Optimization',
      service: 'S3',
      category: 'storage_optimization',
      description: 'Move infrequently accessed data to lower-cost storage tiers.',
      estimated_savings: 95.30,
      savings_percentage: 50,
      implementation_effort: 'low'
    },
    {
      id: 'opt-4',
      title: 'Cleanup Idle Resources',
      service: 'RDS',
      category: 'idle_resources',
      description: 'Identify and remove unused RDS instances to eliminate unnecessary costs.',
      estimated_savings: 150.80,
      savings_percentage: 90,
      implementation_effort: 'medium'
    },
    {
      id: 'opt-5',
      title: 'Azure Hybrid Benefit',
      service: 'VM',
      category: 'licensing_optimization',
      description: 'Use existing Windows Server licenses with Azure Hybrid Benefit.',
      estimated_savings: 80.45,
      savings_percentage: 40,
      implementation_effort: 'low'
    }
  ];
  
  // Calculate summary metrics
  const total_cost = historical_data.reduce((sum, item) => sum + item.cost, 0);
  const forecast_total = forecast.reduce((sum, item) => sum + item.predicted_cost, 0);
  const potential_savings = optimizations.reduce((sum, item) => sum + item.estimated_savings, 0);
  
  return {
    summary: {
      historical_data: historical_data,
      total_cost: parseFloat(total_cost.toFixed(2)),
      forecast_total: parseFloat(forecast_total.toFixed(2)),
      anomaly_count: anomalies.length,
      potential_savings: parseFloat(potential_savings.toFixed(2)),
      days_analyzed: 30,
      days_forecasted: 14
    },
    forecast: forecast,
    anomalies: anomalies,
    optimizations: optimizations,
    ai_metadata: {
      forecast_algorithm: 'ensemble',
      anomaly_method: 'isolation_forest',
      optimization_categories: 5
    }
  };
}

// Mock AI API service functions that work without a backend
const aiService = {
  // Get AI capabilities status
  getAIStatus: async () => {
    try {
      // Try to use the real API first
      const response = await apiClient.get("/ai/status");
      return response.data;
    } catch (error) {
      console.log("Using mock AI status data");
      // Return mock data on error
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

  // Toggle enhanced AI capabilities
  configureAI: async (enableEnhanced) => {
    try {
      // Try to use the real API first
      const response = await apiClient.post("/ai/config", {
        enable_enhanced_ai: enableEnhanced
      });
      return response.data;
    } catch (error) {
      console.log("Using mock AI config response");
      // Return mock data on error
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
          }
        }
      };
    }
  },

  // Generate cost forecast
  generateForecast: async (params = {}) => {
    try {
      // Try to use the real API first
      const response = await apiClient.post("/ai/forecast", {
        service: params.service,
        days_ahead: params.days_ahead || 7,
        algorithm: params.algorithm || "auto"
      });
      return response.data;
    } catch (error) {
      console.log("Using mock forecast data");
      // Return mock data on error
      const dummyData = generateDummyData();
      return {
        forecast: dummyData.forecast,
        algorithm_used: params.algorithm || "auto",
        algorithm_name: "Ensemble Method",
        data_points_used: 30,
        request: params
      };
    }
  },

  // Detect anomalies
  detectAnomalies: async (params = {}) => {
    try {
      // Try to use the real API first
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
      // Return mock data on error
      const dummyData = generateDummyData();
      return {
        anomalies: dummyData.anomalies,
        detection_method: params.method || "ensemble",
        method_name: "Ensemble Method",
        threshold: params.threshold || 2.0,
        data_points: 30,
        request: params
      };
    }
  },

  // Generate optimization recommendations
  generateOptimizations: async (params = {}) => {
    try {
      // Try to use the real API first
      const response = await apiClient.post("/ai/optimize", {
        targeted_services: params.targeted_services || null,
        include_utilization_data: params.include_utilization_data !== false
      });
      return response.data;
    } catch (error) {
      console.log("Using mock optimization data");
      // Return mock data on error
      const dummyData = generateDummyData();
      return {
        recommendations: dummyData.optimizations,
        potential_savings: dummyData.summary.potential_savings,
        potential_savings_percentage: 28.5,
        total_analyzed_cost: dummyData.summary.total_cost,
        recommendation_count: dummyData.optimizations.length,
        request: params
      };
    }
  },

  // Get combined AI insights
  getCombinedInsights: async (params = {}) => {
    try {
      // Try to use the real API first
      const response = await apiClient.get("/ai/combined-insights", {
        params: {
          days: params.days || 30,
          forecast_days: params.forecast_days || 14
        }
      });
      return response.data;
    } catch (error) {
      console.log("Using mock combined insights data");
      // Return mock data on error
      return generateDummyData();
    }
  }
};

export default aiService; 