import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import CloudIcon from '@mui/icons-material/Cloud';

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage user accounts, roles, and permissions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<PersonIcon />}
                component={Link}
                to="/admin/users"
                color="primary"
              >
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cloud Provider Connections
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Configure and manage cloud provider connections for cost tracking.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<CloudIcon />}
                component={Link}
                to="/admin/cloud-connections"
                color="primary"
              >
                Manage Connections
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
