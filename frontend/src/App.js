// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Layout from './components/Layout';

function App() {
  console.log('App component rendering');
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/recommendations" 
            element={
              <PrivateRoute>
                <Layout>
                  <RecommendationsDashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/cost-analysis" 
            element={
              <PrivateRoute>
                <Layout>
                  <CostAnalysisDashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute>
                <AdminRoute>
                  <Layout>
                    <UserList />
                  </Layout>
                </AdminRoute>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/admin/users/new" 
            element={
              <PrivateRoute>
                <AdminRoute>
                  <Layout>
                    <UserForm />
                  </Layout>
                </AdminRoute>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:userId" 
            element={
              <PrivateRoute>
                <AdminRoute>
                  <Layout>
                    <UserForm />
                  </Layout>
                </AdminRoute>
              </PrivateRoute>
            } 
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;