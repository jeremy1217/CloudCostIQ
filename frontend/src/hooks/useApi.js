import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ==== COST DATA HOOKS ====

// Custom hook for fetching cloud costs
export const useCloudCosts = () => {
  return useQuery({
    queryKey: ['cloudCosts'],
    queryFn: api.getCloudCosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for fetching cost breakdown
export const useCostBreakdown = () => {
  return useQuery({
    queryKey: ['costBreakdown'],
    queryFn: api.getCostBreakdown,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==== FORECASTING HOOKS ====

// Custom hook for cost predictions
export const useCostPredictions = (params = {}) => {
  return useQuery({
    queryKey: ['costPredictions', params],
    queryFn: () => api.getCostPredictions(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ==== ANOMALY DETECTION HOOKS ====

// Custom hook for anomaly detection
export const useAnomalyDetection = (params = {}) => {
  return useQuery({
    queryKey: ['anomalies', params],
    queryFn: () => api.getAnomalyDetection(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// ==== ATTRIBUTION HOOKS ====

// Custom hook for cost attribution
export const useCostAttribution = (attributionType = 'team', timeRange = 'month') => {
  return useQuery({
    queryKey: ['attribution', attributionType, timeRange],
    queryFn: () => api.getCostAttribution(attributionType, timeRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for untagged resources
export const useUntaggedResources = () => {
  return useQuery({
    queryKey: ['untaggedResources'],
    queryFn: api.getUntaggedResources,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ==== OPTIMIZATION HOOKS ====

// Custom hook for optimization recommendations
export const useOptimizationRecommendations = () => {
  return useQuery({
    queryKey: ['optimizationRecommendations'],
    queryFn: api.getOptimizationRecommendations,
    retry: 1, // Only retry once
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Custom hook for applying optimization
export const useApplyOptimization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ provider, service }) => api.applyOptimization(provider, service),
    onSuccess: () => {
      // Invalidate and refetch recommendations after applying an optimization
      queryClient.invalidateQueries({ queryKey: ['optimizationRecommendations'] });
    },
  });
};

// ==== AI DASHBOARD HOOKS ====

// Custom hook for AI status
export const useAIStatus = () => {
  return useQuery({
    queryKey: ['aiStatus'],
    queryFn: api.getAIStatus,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
};

// Custom hook for combined insights
export const useCombinedInsights = (params = {}) => {
  return useQuery({
    queryKey: ['combinedInsights', params],
    queryFn: () => api.getCombinedInsights(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for toggling enhanced AI
export const useToggleEnhancedAI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enableEnhanced) => api.configureAI(enableEnhanced),
    onSuccess: () => {
      // Invalidate and refetch AI status and insights after toggling
      queryClient.invalidateQueries({ queryKey: ['aiStatus'] });
      queryClient.invalidateQueries({ queryKey: ['combinedInsights'] });
    },
  });
};

// Custom hook for generating forecast
export const useGenerateForecast = (params = {}) => {
  return useQuery({
    queryKey: ['aiForecasting', params],
    queryFn: () => api.generateForecast(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for detecting anomalies
export const useDetectAnomalies = (params = {}) => {
  return useQuery({
    queryKey: ['aiAnomalies', params],
    queryFn: () => api.detectAnomalies(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};