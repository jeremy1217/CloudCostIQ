import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { mockUsers } from '../services/mockData';

const SettingsPage = () => {
  const [user, setUser] = useState(mockUsers[0]); // Using the first mock user
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    weeklyReport: true,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: 'Profile updated successfully',
      severity: 'success'
    });
  };

  const handleSaveNotifications = () => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: 'Notification preferences updated',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Settings
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={user.username}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={user.full_name}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" onClick={handleSaveProfile}>
                Save Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.email}
                      onChange={handleNotificationChange}
                      name="email"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.slack}
                      onChange={handleNotificationChange}
                      name="slack"
                    />
                  }
                  label="Slack Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.weeklyReport}
                      onChange={handleNotificationChange}
                      name="weeklyReport"
                    />
                  }
                  label="Weekly Cost Report"
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" onClick={handleSaveNotifications}>
                Save Notifications
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* API Keys */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Keys
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage your API keys for cloud provider integrations.
              </Typography>
              <Button variant="outlined" color="primary">
                Manage API Keys
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage; 