import React from 'react';

const RecommendationsTab = ({ recommendations, formatDollar, getBadgeColor, expandedCard, setExpandedCard }) => {
  return (
    <div>
      {recommendations.map((recommendation) => (
        <div 
          key={recommendation.id} 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            marginBottom: '16px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              padding: '16px', 
              borderBottom: expandedCard === recommendation.id ? '1px solid #e5e7eb' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setExpandedCard(expandedCard === recommendation.id ? null : recommendation.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{recommendation.title}</h3>
                  <div style={{ 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    fontSize: '12px',
                    ...getBadgeColor(recommendation.impact)
                  }}>
                    {recommendation.impact} Impact
                  </div>
                  <div style={{ 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    fontSize: '12px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563'
                  }}>
                    {recommendation.category}
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>{recommendation.description}</p>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                  {formatDollar(recommendation.savings)}/mo
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Potential Savings
                </div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {expandedCard === recommendation.id ? 'Click to collapse' : 'Click to expand details'}
              </span>
              <span>{expandedCard === recommendation.id ? '▲' : '▼'}</span>
            </div>
          </div>
          
          {expandedCard === recommendation.id && (
            <div style={{ padding: '16px', backgroundColor: '#f9fafb' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Detailed Analysis</h4>
              
              {recommendation.category === 'Compute' && recommendation.title.includes('Rightsizing') && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Instance ID</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>CPU Utilization</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Current Type</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Recommended Type</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Monthly Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendation.details.map((detail, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>{detail.instance}</td>
                          <td style={{ padding: '8px' }}>{detail.utilization}</td>
                          <td style={{ padding: '8px' }}>{detail.currentType}</td>
                          <td style={{ padding: '8px' }}>{detail.recommendedType}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatDollar(detail.monthlySavings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {recommendation.category === 'Storage' && recommendation.title.includes('Unattached') && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Volume ID</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Size</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Unused Days</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Monthly Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendation.details.map((detail, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>{detail.volumeId}</td>
                          <td style={{ padding: '8px' }}>{detail.size}</td>
                          <td style={{ padding: '8px' }}>{detail.unusedDays}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatDollar(detail.monthlyCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {recommendation.category === 'Compute' && recommendation.title.includes('Reserved') && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Instance ID</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Region</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Running Hours</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Monthly Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendation.details.map((detail, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>{detail.instance}</td>
                          <td style={{ padding: '8px' }}>{detail.type}</td>
                          <td style={{ padding: '8px' }}>{detail.region}</td>
                          <td style={{ padding: '8px' }}>{detail.runningHours}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatDollar(detail.monthlySavings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {recommendation.category === 'Storage' && recommendation.title.includes('S3') && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Bucket</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Size</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Current Class</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Recommended Class</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Last Accessed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendation.details.map((detail, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px' }}>{detail.bucket}</td>
                          <td style={{ padding: '8px' }}>{detail.size}</td>
                          <td style={{ padding: '8px' }}>{detail.currentClass}</td>
                          <td style={{ padding: '8px' }}>{detail.recommendedClass}</td>
                          <td style={{ padding: '8px' }}>{detail.lastAccessed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button style={{ 
                  padding: '8px 12px', 
                  backgroundColor: 'white', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  Ignore
                </button>
                <button style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  Take Action
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecommendationsTab;