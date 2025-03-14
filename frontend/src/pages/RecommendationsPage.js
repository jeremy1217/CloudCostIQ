import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  PriorityHigh as HighPriorityIcon,
  Warning as MediumPriorityIcon,
  Info as InfoIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { mockRecommendations } from '../services/mockData';

const RecommendationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityIcon = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <HighPriorityIcon color="error" />;
      case 'medium':
        return <MediumPriorityIcon color="warning" />;
      case 'low':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredRecommendations = mockRecommendations.filter(rec =>
    rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecommendation(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cost Optimization Recommendations
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search recommendations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <List>
        {filteredRecommendations.map((recommendation, index) => (
          <Paper key={index} sx={{ mb: 2 }}>
            <ListItem
              button
              onClick={() => handleOpenDialog(recommendation)}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <ListItemIcon>
                  {getPriorityIcon(recommendation.priority)}
                </ListItemIcon>
                <ListItemText
                  primary={recommendation.title}
                  secondary={`Potential Savings: ${formatCurrency(recommendation.potential_savings)}`}
                />
                <Chip
                  icon={getStatusIcon(recommendation.status)}
                  label={recommendation.status}
                  color={recommendation.status.toLowerCase() === 'completed' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
                {recommendation.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 7 }}>
                <Chip
                  label={recommendation.priority}
                  color={getPriorityColor(recommendation.priority)}
                  size="small"
                />
                <Chip
                  label={`Created: ${formatDate(recommendation.created_at)}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedRecommendation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getPriorityIcon(selectedRecommendation.priority)}
                {selectedRecommendation.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedRecommendation.description}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Potential Savings
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(selectedRecommendation.potential_savings)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedRecommendation.priority}
                    color={getPriorityColor(selectedRecommendation.priority)}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedRecommendation.status)}
                    label={selectedRecommendation.status}
                    color={selectedRecommendation.status.toLowerCase() === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedRecommendation.created_at)}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button variant="contained" color="primary">
                Apply Recommendation
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RecommendationsPage; 