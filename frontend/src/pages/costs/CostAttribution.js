import React from 'react';
import { Container, Typography } from '@mui/material';
import CostAttribution from '../../components/CostAttribution';

const CostAttributionPage = () => {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>Cost Attribution</Typography>
            <CostAttribution />
        </Container>
    );
};

export default CostAttributionPage;