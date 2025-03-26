// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, login as authLogin, logout as authLogout, getProfile } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await getProfile();
          setUserProfile(profile);
        } catch (error) {
          // Token might be expired, log out
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (email, password) => {
    const user = await authLogin(email, password);
    setCurrentUser(user);
    const profile = await getProfile();
    setUserProfile(profile);
    return user;
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setUserProfile(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    userProfile,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};