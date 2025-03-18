import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ROW_HEIGHT = 53; // Height of each row in pixels
const BUFFER_SIZE = 5; // Number of rows to render above and below visible area

const VirtualTable = ({
  columns,
  data,
  rowHeight = ROW_HEIGHT,
  bufferSize = BUFFER_SIZE,
  onRowClick,
  loading = false,
  defaultSortField,
  defaultSortDirection = 'asc'
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [filters, setFilters] = useState({});
  const containerRef = useRef(null);

  // Memoize sorted and filtered data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        result = result.filter(item => {
          const itemValue = String(item[field]).toLowerCase();
          return itemValue.includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      });
    }

    return result;
  }, [data, filters, sortField, sortDirection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize);
    const visibleCount = Math.ceil(containerHeight / rowHeight) + 2 * bufferSize;
    const endIndex = Math.min(processedData.length, startIndex + visibleCount);

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [scrollTop, processedData.length, rowHeight, bufferSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilter = (field) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  const totalHeight = processedData.length * rowHeight;
  const startOffset = visibleRange.start * rowHeight;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {columns.map(column => (
          <TextField
            key={column.id}
            size="small"
            placeholder={`Filter ${column.label}`}
            value={filters[column.id] || ''}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters[column.id] && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => clearFilter(column.id)}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ))}
      </Box>
      <TableContainer
        ref={containerRef}
        component={Paper}
        sx={{
          height: '100%',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ backgroundColor: 'background.paper' }}
                >
                  <TableSortLabel
                    active={sortField === column.id}
                    direction={sortField === column.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                <div style={{ height: startOffset }} />
                {processedData.slice(visibleRange.start, visibleRange.end).map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    hover
                    onClick={() => onRowClick?.(row)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                      >
                        {column.render ? column.render(row) : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <div style={{ height: totalHeight - (visibleRange.end * rowHeight) }} />
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VirtualTable; 