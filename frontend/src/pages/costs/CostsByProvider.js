import React from 'react';
import { Container, Typography } from '@mui/material';
import CostTable from '../../components/CostTable';

const CostsByProvider = () => {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>Costs By Provider</Typography>
            <CostTable />
        </Container>
    );
};

export default CostsByProvider;