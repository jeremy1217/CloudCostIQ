import React, { useState } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { mockCloudCosts } from '../services/mockData';

const CostAnalysisPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredCosts = mockCloudCosts.filter(cost => 
    cost.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cost.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalCost = mockCloudCosts.reduce((sum, cost) => sum + cost.cost, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cost Analysis</Typography>
        <Typography variant="h6" color="primary">
          Total Cost: {formatCurrency(totalCost)}
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by service, resource ID, or region..."
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Resource ID</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Tags</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCosts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((cost, index) => (
                <TableRow key={index}>
                  <TableCell>{cost.provider}</TableCell>
                  <TableCell>{cost.service}</TableCell>
                  <TableCell>{cost.resource_id}</TableCell>
                  <TableCell>{cost.region}</TableCell>
                  <TableCell>{formatCurrency(cost.cost)}</TableCell>
                  <TableCell>{formatDate(cost.date)}</TableCell>
                  <TableCell>
                    {cost.tags.map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
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