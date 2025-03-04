import React from 'react';
import MultiCloudComparison from '../components/MultiCloudComparison';

const MultiCloudComparisonPage = () => {
  return (
    <div>
      <div style={{ padding: '20px' }}>
        <h1>Multi-Cloud Comparison</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Compare costs across providers, analyze migration expenses, and identify multi-cloud optimization opportunities.
        </p>
        
        {/* Main component */}
        <MultiCloudComparison />
      </div>
    </div>
  );
};

export default MultiCloudComparisonPage;