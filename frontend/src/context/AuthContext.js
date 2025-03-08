import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// Create context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for saved token on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validate token by checking expiration
          const decoded = jwt_decode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('auth_token');
            setUser(null);
          } else {
            // Set up axios with the token
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Fetch user info (optional)
            const response = await axios.get(`${API_BASE_URL}/auth/me`);
            setUser(response.data);
          }
        } catch (err) {
          console.error('Error validating token:', err);
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert credentials to form data format as required by OAuth
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(
        `${API_BASE_URL}/auth/token`, 
        formData
      );
      
      const { access_token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('auth_token', access_token);
      
      // Set up axios with the new token
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Decode token to get user info
      const decoded = jwt_decode(access_token);
      setUser({ username: decoded.sub });
      
      // Redirect to the dashboard
      navigate('/');
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );
      
      // Auto login after successful registration
      await login(userData.username, userData.password);
      
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}