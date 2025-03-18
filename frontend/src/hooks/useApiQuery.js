import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useApiQuery = (key, endpoint, options = {}) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data;
    },
    ...options,
  });
};

export const useApiMutation = (endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(endpoint, data);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries
      if (options.invalidateQueries) {
        queryClient.invalidateQueries(options.invalidateQueries);
      }
      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Call error callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export const useApiPut = (endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.put(endpoint, data);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        queryClient.invalidateQueries(options.invalidateQueries);
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

export const useApiDelete = (endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(endpoint);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        queryClient.invalidateQueries(options.invalidateQueries);
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}; 