import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '@mui/material';

const AdminGuard = ({ children }) => {
    const { user } = useAuth();

    // Check if user exists and has admin role
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check for both admin role and ensure user is not a customer
    if (!user.roles?.includes('admin') || user.type === 'customer') {
        // Log unauthorized access attempt
        console.error('Unauthorized admin access attempt:', {
            userId: user.id,
            userType: user.type,
            timestamp: new Date().toISOString()
        });

        return (
            <Navigate to="/" replace />
        );
    }

    return children;
};

export default AdminGuard; 