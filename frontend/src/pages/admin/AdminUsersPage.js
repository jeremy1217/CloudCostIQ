import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Mock data that matches our user model
const mockUsers = [
  {
    id: 1,
    email: 'admin@cloudcostiq.com',
    type: 'staff',
    role_names: ['admin'],
    is_active: true,
    created_at: '2024-03-18T00:00:00Z',
    last_login: '2024-03-18T12:00:00Z',
    first_name: 'Admin',
    last_name: 'User',
    company: 'CloudCostIQ',
    phone: '+1 (555) 123-4567',
    preferences: {},
    two_factor_enabled: false
  },
  {
    id: 2,
    email: 'user@example.com',
    type: 'customer',
    role_names: ['user'],
    is_active: true,
    created_at: '2024-03-17T00:00:00Z',
    last_login: '2024-03-18T10:00:00Z',
    first_name: 'Regular',
    last_name: 'User',
    company: 'Example Corp',
    phone: '+1 (555) 987-6543',
    preferences: {},
    two_factor_enabled: false
  }
];

const AdminUsersPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = () => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: selectedUser ? 'User updated successfully' : 'User created successfully',
      severity: 'success'
    });
    handleCloseDialog();
  };

  const handleDeleteUser = (userId) => {
    // In a real app, this would make an API call
    setSnackbar({
      open: true,
      message: 'User deleted successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.type}
                      size="small"
                      color={user.type === 'staff' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {user.role_names.map((role, index) => (
                      <Chip
                        key={index}
                        label={role}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.last_login)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={mockUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue={selectedUser?.email}
            />
            <TextField
              fullWidth
              label="First Name"
              defaultValue={selectedUser?.first_name}
            />
            <TextField
              fullWidth
              label="Last Name"
              defaultValue={selectedUser?.last_name}
            />
            <TextField
              fullWidth
              label="Company"
              defaultValue={selectedUser?.company}
            />
            <TextField
              fullWidth
              select
              label="Type"
              defaultValue={selectedUser?.type || 'customer'}
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Roles"
              defaultValue={selectedUser?.role_names || []}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                ),
              }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveUser}>
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminUsersPage; 