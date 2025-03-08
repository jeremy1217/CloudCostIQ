import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm({
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      full_name: user?.full_name || ''
    }
  });
  
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  
  const onUpdateProfile = async (data) => {
    setUpdating(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/update-profile`, data);
      setUpdateSuccess(true);
      
      // Update local user info if necessary
      // (In a full implementation, you might need to refresh the user context)
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };
  
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm();
  
  const onChangePassword = async (data) => {
    setChangingPassword(true);
    setPasswordSuccess(false);
    setPasswordError(null);
    
    try {
      if (data.new_password !== data.confirm_password) {
        setPasswordError('New passwords do not match');
        setChangingPassword(false);
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
        current_password: data.current_password,
        new_password: data.new_password
      });
      
      setPasswordSuccess(true);
      resetPassword();
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            {updateSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile updated successfully!
              </Alert>
            )}
            
            {updateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateError}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onUpdateProfile)}>
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Username"
                disabled
                value={user?.username || ''}
                helperText="Username cannot be changed"
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="full_name"
                label="Full Name"
                {...register('full_name')}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={updating}
              >
                {updating ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Password changed successfully!
              </Alert>
            )}
            
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <form onSubmit={handleSubmitPassword(onChangePassword)}>
              <TextField
                margin="normal"
                fullWidth
                id="current_password"
                label="Current Password"
                type="password"
                {...registerPassword('current_password', { 
                  required: 'Current password is required'
                })}
                error={!!passwordErrors.current_password}
                helperText={passwordErrors.current_password?.message}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="new_password"
                label="New Password"
                type="password"
                {...registerPassword('new_password', { 
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                error={!!passwordErrors.new_password}
                helperText={passwordErrors.new_password?.message}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="confirm_password"
                label="Confirm New Password"
                type="password"
                {...registerPassword('confirm_password', { 
                  required: 'Please confirm your new password'
                })}
                error={!!passwordErrors.confirm_password}
                helperText={passwordErrors.confirm_password?.message}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={changingPassword}
              >
                {changingPassword ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;