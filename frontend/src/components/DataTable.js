import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  IconButton,
  Typography,
  Skeleton,
  TablePagination,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const DataTable = ({
  columns,
  data,
  loading = false,
  title,
  initialSortBy,
  initialOrder = 'asc',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  filterableColumns = [],
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [order, setOrder] = useState(initialOrder);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = sortBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Handle filtering
  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setPage(0);
  };

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let processed = [...data];

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        processed = processed.filter(row => {
          const value = row[key];
          return value?.toString().toLowerCase().includes(filters[key].toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      processed.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return order === 'desc' ? -comparison : comparison;
      });
    }

    return processed;
  }, [data, filters, sortBy, order]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Paper elevation={0} sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: 2, pr: 1 }}>
          <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
            <Skeleton width={200} />
          </Typography>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton width={100} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(rowsPerPage)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton width={column.width || 100} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ width: '100%', mb: 2 }}>
      <Toolbar
        sx={{
          pl: 2,
          pr: 1,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {filterableColumns.length > 0 && (
          <Box>
            <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      {showFilters && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {filterableColumns.map((column) => (
            <TextField
              key={column.id}
              label={`Filter ${column.label}`}
              variant="outlined"
              size="small"
              value={filters[column.id] || ''}
              onChange={(e) => handleFilterChange(column.id, e.target.value)}
              InputProps={{
                endAdornment: filters[column.id] ? (
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange(column.id, '')}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <SearchIcon color="action" />
                ),
              }}
            />
          ))}
        </Box>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={sortBy === column.id ? order : false}
                  sx={{ fontWeight: 600 }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  hover
                  key={row.id || index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.render ? column.render(row[column.id], row) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {filteredAndSortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary">
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable; 