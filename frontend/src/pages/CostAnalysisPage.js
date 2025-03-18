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
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

const CostAnalysisPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const response = await api.getCloudCosts();
        if (!response || !response.costs) {
          throw new Error('Invalid cost data structure');
        }
        setCosts(response.costs);
        setError(null);
      } catch (err) {
        console.error('Error fetching cost data:', err);
        setError('Failed to load cost data');
        // Set fallback mock data
        setCosts([
          { provider: 'AWS', service: 'EC2', cost: 120.50, date: '2025-02-20', region: 'us-east-1' },
          { provider: 'Azure', service: 'VM', cost: 98.75, date: '2025-02-21', region: 'eastus' },
          { provider: 'GCP', service: 'Compute Engine', cost: 85.20, date: '2025-02-22', region: 'us-central1' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredCosts = costs.filter(cost => 
    cost.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalCost = costs.reduce((sum, cost) => sum + cost.cost, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Cost Analysis
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Total Cost: {formatCurrency(totalCost)}
      </Typography>

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by service or region..."
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
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCosts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((cost, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Chip label={cost.provider} />
                  </TableCell>
                  <TableCell>{cost.service}</TableCell>
                  <TableCell>{cost.region}</TableCell>
                  <TableCell>{formatDate(cost.date)}</TableCell>
                  <TableCell align="right">{formatCurrency(cost.cost)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default CostAnalysisPage; 