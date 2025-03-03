// frontend/src/hooks/useApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ==== COST DATA HOOKS ====

export const useCloudCosts = () => {
  return useQuery({
    queryKey: ['cloudCosts'],
    queryFn: api.getCloudCosts,
  });
};

export const useCostBreakdown = () => {
  return useQuery({
    queryKey: ['costBreakdown'],
    queryFn: api.getCostBreakdown,
  });
};

// ==== FORECASTING HOOKS ====

export const useCostPredictions = (params = {}) => {
  return useQuery({
    queryKey: ['costPredictions', params],
    queryFn: () => api.getCostPredictions(params),
  });
};

// ==== ANOMALY DETECTION HOOKS ====

export const useAnomalyDetection = (params = {}) => {
  return useQuery({
    queryKey: ['anomalies', params],
    queryFn: () => api.getAnomalyDetection(params),
  });
};

// ==== ATTRIBUTION HOOKS ====

export const useCostAttribution = (attributionType = 'team', timeRange = 'month') => {
  return useQuery({
    queryKey: ['attribution', attributionType, timeRange],
    queryFn: () => api.getCostAttribution(attributionType, timeRange),
  });
};

export const useUntaggedResources = () => {
  return useQuery({
    queryKey: ['untaggedResources'],
    queryFn: api.getUntaggedResources,
  });
};

// ==== OPTIMIZATION HOOKS ====

export const useOptimizationRecommendations = () => {
  return useQuery({
    queryKey: ['optimizationRecommendations'],
    queryFn: api.getOptimizationRecommendations,
  });
};

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

export const useAIStatus = () => {
  return useQuery({
    queryKey: ['aiStatus'],
    queryFn: () => api.getAIStatus ? api.getAIStatus() : { enabled: false },
  });
};

export const useCombinedInsights = (params = {}) => {
  return useQuery({
    queryKey: ['combinedInsights', params],
    queryFn: () => api.getCombinedInsights ? api.getCombinedInsights(params) : {},
  });
};

// Mock AI Service API hooks
export const useToggleEnhancedAI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enableEnhanced) => api.configureAI ? api.configureAI(enableEnhanced) : { status: { enhanced_ai_enabled: enableEnhanced } },
    onSuccess: () => {
      // Invalidate and refetch AI status and insights after toggling
      queryClient.invalidateQueries({ queryKey: ['aiStatus'] });
      queryClient.invalidateQueries({ queryKey: ['combinedInsights'] });
    },
  });
};