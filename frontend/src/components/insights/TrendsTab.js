import React from 'react';

const TrendsTab = ({ trends }) => {
  return (
    <div>
      {trends.map((trend) => (
        <div 
          key={trend.id} 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            marginBottom: '16px',
            padding: '16px'
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{trend.title}</h3>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>{trend.description}</p>
          </div>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            marginBottom: '12px'
          }}>
            <div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Impact:</p>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>{trend.impact}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Recommendation:</p>
              <p style={{ fontSize: '14px' }}>{trend.recommendation}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ 
              padding: '8px 12px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              View Detailed Analysis
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendsTab;