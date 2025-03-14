import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    system: {
      maintenanceMode: false,
      backupFrequency: 'daily',
      retentionPeriod: '30',
      maxUsers: '100',
    },
    notifications: {
      emailEnabled: true,
      slackEnabled: false,
      weeklyReportEnabled: true,
      alertThreshold: '80',
    },
    security: {
      requireMFA: true,
      sessionTimeout: '30',
      maxLoginAttempts: '5',
      passwordExpiry: '90',
    },
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleInputChange = (section, field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = (section) => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: `${section} settings updated successfully`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <Grid container spacing={3}>
        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.system.maintenanceMode}
                      onChange={handleInputChange('system', 'maintenanceMode')}
                    />
                  }
                  label="Maintenance Mode"
                />
                <TextField
                  select
                  fullWidth
                  label="Backup Frequency"
                  value={settings.system.backupFrequency}
                  onChange={handleInputChange('system', 'backupFrequency')}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </TextField>
                <TextField
                  fullWidth
                  label="Data Retention Period (days)"
                  type="number"
                  value={settings.system.retentionPeriod}
                  onChange={handleInputChange('system', 'retentionPeriod')}
                />
                <TextField
                  fullWidth
                  label="Maximum Users"
                  type="number"
                  value={settings.system.maxUsers}
                  onChange={handleInputChange('system', 'maxUsers')}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveSettings('System')}
              >
                Save System Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailEnabled}
                      onChange={handleInputChange('notifications', 'emailEnabled')}
                    />
                  }
                  label="Enable Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.slackEnabled}
                      onChange={handleInputChange('notifications', 'slackEnabled')}
                    />
                  }
                  label="Enable Slack Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.weeklyReportEnabled}
                      onChange={handleInputChange('notifications', 'weeklyReportEnabled')}
                    />
                  }
                  label="Enable Weekly Cost Report"
                />
                <TextField
                  fullWidth
                  label="Cost Alert Threshold (%)"
                  type="number"
                  value={settings.notifications.alertThreshold}
                  onChange={handleInputChange('notifications', 'alertThreshold')}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveSettings('Notification')}
              >
                Save Notification Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.requireMFA}
                      onChange={handleInputChange('security', 'requireMFA')}
                    />
                  }
                  label="Require Multi-Factor Authentication"
                />
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={handleInputChange('security', 'sessionTimeout')}
                />
                <TextField
                  fullWidth
                  label="Maximum Login Attempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={handleInputChange('security', 'maxLoginAttempts')}
                />
                <TextField
                  fullWidth
                  label="Password Expiry (days)"
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={handleInputChange('security', 'passwordExpiry')}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveSettings('Security')}
              >
                Save Security Settings
              </Button>
            </CardActions>
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

export default AdminSettingsPage; 