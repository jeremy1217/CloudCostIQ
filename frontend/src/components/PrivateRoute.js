// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);
  
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
        <p style={{ marginTop: '20px' }}>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    console.log('PrivateRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  console.log('PrivateRoute - Authenticated, rendering children');
  return children;
};

export default PrivateRoute;