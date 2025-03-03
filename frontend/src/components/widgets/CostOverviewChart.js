import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CostChart from './CostChart';

const CostOverviewChart = () => {
    // Reuse the existing CostChart component
    return (
        <Box>
            <CostChart />
        </Box>
    );
};

export default CostOverviewChart;