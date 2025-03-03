import React from 'react';
import { Container, Typography } from '@mui/material';
import CostBreakdown from '../../components/CostBreakdown';

const CostsByService = () => {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>Costs By Service</Typography>
            <CostBreakdown />
        </Container>
    );
};

export default CostsByService;