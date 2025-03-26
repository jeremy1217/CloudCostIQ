import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const register = async (email, password, fullName, companyName) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
      full_name: fullName,
      company_name: companyName
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, 
      new URLSearchParams({
        'username': email,
        'password': password,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const authHeader = () => {
  const user = getCurrentUser();
  
  if (user && user.access_token) {
    return { Authorization: `Bearer ${user.access_token}` };
  } else {
    return {};
  }
};

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};