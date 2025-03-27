import api from './api';

export const getUsers = async (params) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/me', profileData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};