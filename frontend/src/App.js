// src/App.js with added routes for cost analysis
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './components/profile/UserProfile';
import UserList from './components/admin/UserList';
import UserForm from './components/admin/UserForm';
import RecommendationsDashboard from './components/Recommendations';
import CostAnalysisDashboard from './components/CostAnalysisDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/recommendations" element={<RecommendationsDashboard />} />
                <Route path="/cost-analysis" element={<CostAnalysisDashboard />} />
                
                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UserList />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users/new"
                  element={
                    <AdminRoute>
                      <UserForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users/:userId"
                  element={
                    <AdminRoute>
                      <UserForm />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;