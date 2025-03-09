import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', provider: 'AWS', credentials: {} });
  const [createdKey, setCreatedKey] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api-keys`);
      setApiKeys(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Failed to load API keys. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api-keys`, newKey);
      setCreatedKey(response.data);
      await fetchApiKeys();
      showSnackbar('API key created successfully', 'success');
    } catch (err) {
      console.error('Error creating API key:', err);
      showSnackbar('Failed to create API key', 'error');
    }
  };

  const handleDeleteKey = async (keyId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api-keys/${keyId}`);
      await fetchApiKeys();
      showSnackbar('API key deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting API key:', err);
      showSnackbar('Failed to delete API key', 'error');
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    showSnackbar('API key copied to clipboard', 'success');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCreatedKey(null);
    setNewKey({ name: '', provider: 'AWS' });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


// Add provider-specific credential fields
const renderCredentialFields = () => {
switch(newKey.provider) {
  case 'AWS':
    return (
      <>
        <TextField
          fullWidth
          label="Access Key ID"
          value={newKey.credentials.access_key_id || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              access_key_id: e.target.value
            }
          })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Secret Access Key"
          value={newKey.credentials.secret_access_key || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              secret_access_key: e.target.value
            }
          })}
          margin="normal"
          required
          type="password"
        />
      </>
    );
  case 'Azure':
    return (
      <>
        <TextField
          fullWidth
          label="Tenant ID"
          value={newKey.credentials.tenant_id || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              tenant_id: e.target.value
            }
          })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Client ID"
          value={newKey.credentials.client_id || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              client_id: e.target.value
            }
          })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Client Secret"
          value={newKey.credentials.client_secret || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              client_secret: e.target.value
            }
          })}
          margin="normal"
          required
          type="password"
        />
      </>
    );
  case 'GCP':
    return (
      <>
        <TextField
          fullWidth
          label="Project ID"
          value={newKey.credentials.project_id || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              project_id: e.target.value
            }
          })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Service Account Key (JSON)"
          value={newKey.credentials.service_account_key || ''}
          onChange={(e) => setNewKey({ 
            ...newKey, 
            credentials: {
              ...newKey.credentials,
              service_account_key: e.target.value
            }
          })}
          margin="normal"
          required
        />
      </>
    );
  default:
    return null;
}
};

// Update the dialog content to include credential fields
// Replace the old dialog content with:
{createdKey ? (
<Box sx={{ mt: 2 }}>
  <Alert severity="warning" sx={{ mb: 2 }}>
    This key will only be shown once. Make sure to copy it now.
  </Alert>
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <TextField
      fullWidth
      value={createdKey.key}
      label="API Key"
      InputProps={{
        readOnly: true,
      }}
      variant="outlined"
    />
    <IconButton 
      color="primary" 
      onClick={() => handleCopyKey(createdKey.key)}
      sx={{ ml: 1 }}
    >
      <ContentCopyIcon />
    </IconButton>
  </Box>
  <Typography variant="body2" color="textSecondary">
    Key details:
  </Typography>
  <Box sx={{ mt: 1 }}>
    <Typography variant="body2">
      <strong>Name:</strong> {createdKey.name}
    </Typography>
    <Typography variant="body2">
      <strong>Provider:</strong> {createdKey.provider}
    </Typography>
    <Typography variant="body2">
      <strong>Created:</strong> {new Date(createdKey.created_at).toLocaleString()}
    </Typography>
  </Box>
</Box>
) : (
<Box sx={{ mt: 2 }}>
  <TextField
    fullWidth
    label="Key Name"
    value={newKey.name}
    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
    margin="normal"
    required
    helperText="Give your key a descriptive name"
  />
  <FormControl fullWidth margin="normal">
    <InputLabel id="provider-label">Cloud Provider</InputLabel>
    <Select
      labelId="provider-label"
      value={newKey.provider}
      label="Cloud Provider"
      onChange={(e) => setNewKey({ 
        ...newKey, 
        provider: e.target.value,
        credentials: {} // Reset credentials when provider changes
      })}
    >
      <MenuItem value="AWS">AWS</MenuItem>
      <MenuItem value="Azure">Azure</MenuItem>
      <MenuItem value="GCP">Google Cloud Platform</MenuItem>
    </Select>
  </FormControl>
  
  {/* Provider-specific credential fields */}
  {renderCredentialFields()}
</Box>
)}

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">API Keys</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Create New API Key
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Provider</b></TableCell>
              <TableCell><b>Created</b></TableCell>
              <TableCell><b>Last Used</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? 'Loading API keys...' : 'No API keys found. Create one to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={key.provider} 
                      color={
                        key.provider === 'AWS' ? 'primary' :
                        key.provider === 'Azure' ? 'info' :
                        key.provider === 'GCP' ? 'success' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={key.is_active ? 'Active' : 'Inactive'} 
                      color={key.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create API Key Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {createdKey ? 'API Key Created' : 'Create New API Key'}
        </DialogTitle>
        <DialogContent>
          {createdKey ? (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This key will only be shown once. Make sure to copy it now.
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  value={createdKey.key}
                  label="API Key"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
                <IconButton 
                  color="primary" 
                  onClick={() => handleCopyKey(createdKey.key)}
                  sx={{ ml: 1 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Key details:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {createdKey.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Provider:</strong> {createdKey.provider}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(createdKey.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Key Name"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                margin="normal"
                required
                helperText="Give your key a descriptive name"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="provider-label">Cloud Provider</InputLabel>
                <Select
                  labelId="provider-label"
                  value={newKey.provider}
                  label="Cloud Provider"
                  onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                >
                  <MenuItem value="AWS">AWS</MenuItem>
                  <MenuItem value="Azure">Azure</MenuItem>
                  <MenuItem value="GCP">Google Cloud Platform</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {createdKey ? (
            <Button onClick={handleCloseDialog} color="primary">Close</Button>
          ) : (
            <>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={handleCreateKey} 
                color="primary"
                disabled={!newKey.name}
              >
                Create
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApiKeyManager;