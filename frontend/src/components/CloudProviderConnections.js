import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
  Stack,
  LinearProgress,
  Divider,
  CardMedia,
  CardActionArea,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const PROVIDER_CONFIGS = {
  AWS: {
    fields: [
      { 
        name: 'accessKeyId', 
        label: 'Access Key ID', 
        type: 'text',
        required: true,
        helperText: 'Your AWS access key ID from IAM credentials'
      },
      { 
        name: 'secretAccessKey', 
        label: 'Secret Access Key', 
        type: 'password',
        required: true,
        helperText: 'Your AWS secret access key from IAM credentials'
      },
      { 
        name: 'region', 
        label: 'Default Region', 
        type: 'text',
        required: true,
        helperText: 'e.g., us-east-1, eu-west-1',
        placeholder: 'us-east-1'
      }
    ],
    logo: '/aws-logo.png',
    color: '#FF9900',
    description: 'Connect your AWS account to track costs across EC2, S3, RDS, and other services.'
  },
  Azure: {
    fields: [
      { 
        name: 'tenantId', 
        label: 'Tenant ID', 
        type: 'text',
        required: true,
        helperText: 'Your Azure AD tenant/directory ID'
      },
      { 
        name: 'clientId', 
        label: 'Client ID', 
        type: 'text',
        required: true,
        helperText: 'Application (client) ID from your Azure AD app registration'
      },
      { 
        name: 'clientSecret', 
        label: 'Client Secret', 
        type: 'password',
        required: true,
        helperText: 'Secret value from your Azure AD app registration'
      },
      { 
        name: 'subscriptionId', 
        label: 'Subscription ID', 
        type: 'text',
        required: true,
        helperText: 'ID of the Azure subscription to monitor'
      }
    ],
    logo: '/azure-logo.png',
    color: '#0078D4',
    description: 'Connect your Azure subscription to monitor costs across your cloud resources.'
  },
  GCP: {
    fields: [
      { 
        name: 'projectId', 
        label: 'Project ID', 
        type: 'text',
        required: true,
        helperText: 'Your Google Cloud project ID'
      },
      { 
        name: 'credentials', 
        label: 'Service Account Key (JSON)', 
        type: 'textarea',
        required: true,
        helperText: 'Paste your service account key JSON file contents'
      }
    ],
    logo: '/gcp-logo.png',
    color: '#4285F4',
    description: 'Connect your Google Cloud project to analyze costs across GCP services.'
  }
};

const CloudProviderConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [editingConnection, setEditingConnection] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/cloud-connections');
      const data = await response.json();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cloud connections');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = (provider) => {
    setSelectedProvider(provider);
    setFormData({});
    setFormErrors({});
    setEditingConnection(null);
    setOpenDialog(true);
  };

  const handleEditConnection = (connection) => {
    setSelectedProvider(connection.provider);
    setFormData(connection.credentials);
    setFormErrors({});
    setEditingConnection(connection);
    setOpenDialog(true);
  };

  const handleDeleteConnection = async (connectionId) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        await fetch(`/api/cloud-connections/${connectionId}`, {
          method: 'DELETE'
        });
        setSnackbar({
          open: true,
          message: 'Connection deleted successfully',
          severity: 'success'
        });
        await fetchConnections();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete connection',
          severity: 'error'
        });
        console.error('Error:', err);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const provider = PROVIDER_CONFIGS[selectedProvider];
    
    provider.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = 'This field is required';
      }
    });

    if (selectedProvider === 'GCP' && formData.credentials) {
      try {
        JSON.parse(formData.credentials);
      } catch (e) {
        errors.credentials = 'Invalid JSON format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/cloud-connections/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: selectedProvider,
          credentials: formData
        })
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      setSnackbar({
        open: true,
        message: 'Connection test successful',
        severity: 'success'
      });
      return true;
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Connection test failed: ' + err.message,
        severity: 'error'
      });
      return false;
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const testResult = await testConnection();
    if (!testResult) {
      return;
    }

    try {
      const endpoint = editingConnection
        ? `/api/cloud-connections/${editingConnection.id}`
        : '/api/cloud-connections';
      
      const method = editingConnection ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: selectedProvider,
          credentials: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save connection');
      }

      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: `Connection ${editingConnection ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      await fetchConnections();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save connection',
        severity: 'error'
      });
      console.error('Error:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleRefreshConnection = async (connectionId) => {
    try {
      await fetch(`/api/cloud-connections/${connectionId}/refresh`, {
        method: 'POST'
      });
      await fetchConnections();
      setSnackbar({
        open: true,
        message: 'Connection refreshed successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh connection',
        severity: 'error'
      });
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading cloud connections...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Available Providers
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(PROVIDER_CONFIGS).map(([provider, config]) => (
          <Grid item xs={12} md={4} key={provider}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => handleAddConnection(provider)}>
                <CardMedia
                  component="img"
                  height="140"
                  image={config.logo}
                  alt={`${provider} logo`}
                  sx={{ objectFit: 'contain', p: 2, bgcolor: 'grey.50' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {provider}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {config.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Active Connections
      </Typography>
      <Grid container spacing={3}>
        {connections.map((connection) => (
          <Grid item xs={12} md={6} key={connection.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <img
                      src={PROVIDER_CONFIGS[connection.provider].logo}
                      alt={`${connection.provider} logo`}
                      style={{ width: 32, height: 32 }}
                    />
                    <Typography variant="h6">
                      {connection.provider}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh connection status">
                      <IconButton
                        onClick={() => handleRefreshConnection(connection.id)}
                        size="small"
                      >
                        <SyncIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit connection">
                      <IconButton
                        onClick={() => handleEditConnection(connection)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete connection">
                      <IconButton
                        onClick={() => handleDeleteConnection(connection.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                
                <Box display="flex" alignItems="center" mt={2}>
                  <Chip
                    icon={connection.status === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={connection.status === 'connected' ? 'Connected' : 'Connection Error'}
                    color={connection.status === 'connected' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>

                <Stack spacing={1} mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Last checked: {new Date(connection.lastChecked).toLocaleString()}
                  </Typography>
                  {connection.lastError && (
                    <Typography variant="body2" color="error">
                      Last error: {connection.lastError}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {connections.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No cloud provider connections configured yet. Click on a provider above to add a new connection.
            </Alert>
          </Grid>
        )}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            {selectedProvider && (
              <img
                src={PROVIDER_CONFIGS[selectedProvider]?.logo}
                alt={`${selectedProvider} logo`}
                style={{ width: 32, height: 32 }}
              />
            )}
            <Typography variant="h6">
              {editingConnection ? 'Edit' : 'Add'} {selectedProvider} Connection
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {testingConnection && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            {selectedProvider && PROVIDER_CONFIGS[selectedProvider].fields.map((field) => (
              <Box key={field.name} sx={{ mb: 2 }}>
                <TextField
                  label={field.label}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  fullWidth
                  required={field.required}
                  error={!!formErrors[field.name]}
                  helperText={formErrors[field.name] || field.helperText}
                  placeholder={field.placeholder}
                  multiline={field.type === 'textarea'}
                  rows={field.type === 'textarea' ? 4 : 1}
                  InputProps={{
                    endAdornment: field.helperText && (
                      <Tooltip title={field.helperText}>
                        <IconButton edge="end">
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={testingConnection}
          >
            {testingConnection ? 'Testing Connection...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CloudProviderConnections; 