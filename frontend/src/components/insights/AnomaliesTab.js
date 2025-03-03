import React from 'react';

const AnomaliesTab = ({ anomalies, getBadgeColor, getStatusColor }) => {
  return (
    <div>
      {anomalies.map((anomaly) => (
        <div 
          key={anomaly.id} 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            marginBottom: '16px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{anomaly.title}</h3>
                <div style={{ 
                  padding: '2px 8px', 
                  borderRadius: '9999px',
                  fontSize: '12px',
                  ...getBadgeColor(anomaly.severity)
                }}>
                  {anomaly.severity} Severity
                </div>
                <div style={{ 
                  padding: '2px 8px', 
                  borderRadius: '9999px',
                  fontSize: '12px',
                  ...getStatusColor(anomaly.status)
                }}>
                  {anomaly.status}
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>{anomaly.description}</p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>Detected on: {new Date(anomaly.date).toLocaleDateString()}</p>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>
                {anomaly.impact}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Cost Impact
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {anomaly.status.toLowerCase() === 'investigating' && (
              <>
                <button style={{ 
                  padding: '8px 12px', 
                  backgroundColor: 'white', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  Dismiss
                </button>
                <button style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  Investigate
                </button>
              </>
            )}
            {anomaly.status.toLowerCase() !== 'investigating' && (
              <button style={{ 
                padding: '8px 12px', 
                backgroundColor: 'white', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                View Details
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnomaliesTab;