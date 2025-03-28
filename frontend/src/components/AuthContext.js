// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, login as authLogin, logout as authLogout, getProfile } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  console.log('AuthProvider rendering, loading:', loading);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth state...');
      try {
        const user = getCurrentUser();
        console.log('Current user from localStorage:', user);
        
        if (user) {
          setCurrentUser(user);
          try {
            console.log('Fetching user profile...');
            const profile = await getProfile();
            console.log('User profile fetched:', profile);
            setUserProfile(profile);
          } catch (error) {
            console.error('Error fetching profile:', error);
            // Token might be expired, log out
            handleLogout('Session expired. Please log in again.');
          }
        } else {
          console.log('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setAuthError('Failed to initialize authentication');
      } finally {
        console.log('Auth initialization complete');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (email, password) => {
    console.log('Login attempt for:', email);
    setAuthError(null);
    
    try {
      const user = await authLogin(email, password);
      console.log('Login successful, user data:', user);
      setCurrentUser(user);
      
      try {
        console.log('Fetching user profile after login...');
        const profile = await getProfile();
        console.log('Profile fetched after login:', profile);
        setUserProfile(profile);
        return user;
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
        // We still consider login successful even if profile fetch fails
        return user;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error.message || 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const handleLogout = (reason = '') => {
    console.log('Logging out, reason:', reason);
    authLogout();
    setCurrentUser(null);
    setUserProfile(null);
    if (reason) {
      // Use setTimeout to avoid navigation during render
      setTimeout(() => {
        navigate('/login', { state: { message: reason } });
      }, 0);
    } else {
      setTimeout(() => {
        navigate('/login');
      }, 0);
    }
  };

  // If there was an auth error, show it instead of a blank page
  if (authError && !loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'red' }}>Authentication Error</h1>
        <p>{authError}</p>
        <button 
          onClick={() => navigate('/login')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Show loading indicator
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #4f46e5',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: '20px' }}>Loading authentication...</p>
      </div>
    );
  }

  const value = {
    currentUser,
    userProfile,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!currentUser,
    loading
  };

  console.log('AuthContext providing value:', {
    isAuthenticated: !!currentUser,
    hasProfile: !!userProfile,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};