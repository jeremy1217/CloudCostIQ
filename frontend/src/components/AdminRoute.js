// src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  if (!userProfile?.is_admin) {
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default AdminRoute;