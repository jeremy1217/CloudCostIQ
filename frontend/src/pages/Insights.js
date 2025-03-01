import React, { useState } from 'react';
// import axios from 'axios'; // Uncomment when ready to use

function Insights() {
  const [activeTab, setActiveTab] = useState('recommendations');
  
  // Mock data for insights
  const recommendations = [
    {
      id: 1,
      title: 'Rightsizing EC2 Instances',
      description: 'Several t3.large instances are significantly underutilized. Consider downsizing to t3.medium.',
      impact: 'High',
      savings: 432.56,
      category: 'Compute',
      details: [
        { instance: 'i-0abc123def456', utilization: '12%', currentType: 't3.large', recommendedType: 't3.medium', monthlySavings: 152.78 },
        { instance: 'i-0def456abc789', utilization: '15%', currentType: 't3.large', recommendedType: 't3.medium', monthlySavings: 152.78 },
        { instance: 'i-0ghi789jkl012', utilization: '17%', currentType: 't3.large', recommendedType: 't3.medium', monthlySavings: 127.00 }
      ]
    },
    {
      id: 2,
      title: 'Unattached EBS Volumes',
      description: 'Multiple EBS volumes are not attached to any instance and incurring charges.',
      impact: 'Medium',
      savings: 67.89,
      category: 'Storage',
      details: [
        { volumeId: 'vol-12345abcdef', size: '100 GB', monthlyCost: 10.00, unusedDays: 23 },
        { volumeId: 'vol-67890ghijkl', size: '250 GB', monthlyCost: 25.00, unusedDays: 45 },
        { volumeId: 'vol-54321mnopqr', size: '500 GB', monthlyCost: 32.89, unusedDays: 12 }
      ]
    },
    {
      id: 3,
      title: 'Reserved Instance Opportunities',
      description: 'Several consistently running instances could benefit from reserved instance pricing.',
      impact: 'High',
      savings: 1245.67,
      category: 'Compute',
      details: [
        { instance: 'i-1abc123def456', type: 'm5.xlarge', region: 'us-east-1', runningHours: '720+', monthlySavings: 432.12 },
        { instance: 'i-2def456abc789', type: 'r5.large', region: 'us-east-1', runningHours: '720+', monthlySavings: 389.76 },
        { instance: 'i-3ghi789jkl012', type: 'c5.large', region: 'us-west-2', runningHours: '720+', monthlySavings: 423.79 }
      ]
    },
    {
      id: 4,
      title: 'S3 Storage Class Optimization',
      description: 'Large amounts of Standard tier S3 data haven\'t been accessed in over 90 days.',
      impact: 'Medium',
      savings: 210.45,
      category: 'Storage',
      details: [
        { bucket: 'company-backups', size: '1.2 TB', currentClass: 'Standard', recommendedClass: 'Infrequent Access', lastAccessed: '120 days ago' },
        { bucket: 'historic-logs', size: '3.5 TB', currentClass: 'Standard', recommendedClass: 'Glacier', lastAccessed: '180 days ago' }
      ]
    }
  ];
  
  const anomalies = [
    {
      id: 1,
      title: 'Unusual EC2 Usage Spike',
      description: 'Detected 200% increase in EC2 usage in us-west-2 region on March 18.',
      severity: 'High',
      date: '2025-03-18',
      impact: '$245.67',
      status: 'Investigating'
    },
    {
      id: 2,
      title: 'Abnormal Data Transfer',
      description: 'Unusual outbound data transfer pattern detected from S3 bucket "analytics-results".',
      severity: 'Medium',
      date: '2025-03-16',
      impact: '$78.23',
      status: 'Resolved'
    },
    {
      id: 3,
      title: 'Lambda Function Cost Spike',
      description: 'Lambda function "data-processor" showed 300% increase in execution time.',
      severity: 'Medium',
      date: '2025-03-15',
      impact: '$112.45',
      status: 'Mitigated'
    }
  ];
  
  const trends = [
    {
      id: 1,
      title: 'Rising EC2 Costs',
      description: 'EC2 costs have increased by 18% month-over-month for the past 3 months.',
      impact: 'Projected $3,500 increase next quarter',
      recommendation: 'Review auto-scaling policies and implement instance scheduling.'
    },
    {
      id: 2,
      title: 'Decreasing S3 Efficiency',
      description: 'S3 storage cost per GB has increased by 12% despite consistent usage patterns.',
      impact: 'Efficency loss of approximately $450/month',
      recommendation: 'Implement lifecycle policies and clean up unused objects.'
    },
    {
      id: 3,
      title: 'Increasing Cross-AZ Data Transfer',
      description: 'Cross-AZ data transfer costs have doubled in the past month.',
      impact: 'Additional $320/month',
      recommendation: 'Review application architecture to reduce cross-AZ communication.'
    }
  ];
  
  // Function to determine the color for impact/severity badges
  const getBadgeColor = (level) => {
    switch(level.toLowerCase()) {
      case 'high':
        return {
          background: '#fee2e2', // light red
          text: '#b91c1c', // darker red
          border: '#fecaca' // medium red
        };
      case 'medium':
        return {
          background: '#fef3c7', // light yellow
          text: '#b45309', // darker yellow/orange
          border: '#fde68a' // medium yellow
        };
      case 'low':
        return {
          background: '#d1fae5', // light green
          text: '#047857', // darker green
          border: '#a7f3d0' // medium green
        };
      default:
        return {
          background: '#e0f2fe', // light blue
          text: '#0369a1', // darker blue
          border: '#bae6fd' // medium blue
        };
    }
  };
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'investigating':
        return {
          background: '#fee2e2', // light red
          text: '#b91c1c', // darker red
        };
      case 'mitigated':
        return {
          background: '#fef3c7', // light yellow
          text: '#b45309', // darker yellow/orange
        };
      case 'resolved':
        return {
          background: '#d1fae5', // light green
          text: '#047857', // darker green
        };
      default:
        return {
          background: '#e0f2fe', // light blue
          text: '#0369a1', // darker blue
        };
    }
  };
  
  // Format dollar amount
  const formatDollar = (amount) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Expandable card state
  const [expandedCard, setExpandedCard] = useState(null);
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Cost Insights</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            color: '#4b5563', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            padding: '8px 12px' 
          }}>
            <span>Export Insights</span>
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
          padding: '16px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Potential Monthly Savings</p>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                ${recommendations.reduce((sum, rec) => sum + rec.savings, 0).toLocaleString()}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                From {recommendations.length} recommendations
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#dcfce7', 
              padding: '8px', 
              borderRadius: '50%', 
              color: '#16a34a' 
            }}>
              $
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
          padding: '16px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Active Anomalies</p>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {anomalies.filter(a => a.status.toLowerCase() === 'investigating').length}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                From {anomalies.length} detected
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#fee2e2', 
              padding: '8px', 
              borderRadius: '50%', 
              color: '#dc2626' 
            }}>
              !
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
          padding: '16px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Cost Trends</p>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {trends.length}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                Requiring attention
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#e0f2fe', 
              padding: '8px', 
              borderRadius: '50%', 
              color: '#0284c7' 
            }}>
              ↗
            </div>
          </div>
        </div>
      </div>
      
      {/* Insight Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={() => setActiveTab('recommendations')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: activeTab === 'recommendations' ? 'bold' : 'normal',
            color: activeTab === 'recommendations' ? '#2563eb' : '#4b5563',
            borderBottom: activeTab === 'recommendations' ? '2px solid #2563eb' : 'none'
          }}
        >
          Cost Recommendations
        </button>
        <button 
          onClick={() => setActiveTab('anomalies')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: activeTab === 'anomalies' ? 'bold' : 'normal',
            color: activeTab === 'anomalies' ? '#2563eb' : '#4b5563',
            borderBottom: activeTab === 'anomalies' ? '2px solid #2563eb' : 'none'
          }}
        >
          Anomalies
        </button>
        <button 
          onClick={() => setActiveTab('trends')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: activeTab === 'trends' ? 'bold' : 'normal',
            color: activeTab === 'trends' ? '#2563eb' : '#4b5563',
            borderBottom: activeTab === 'trends' ? '2px solid #2563eb' : 'none'
          }}
        >
          Cost Trends
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'recommendations' && (
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
      )}
      
      {activeTab === 'anomalies' && (
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
      )}
      
      {activeTab === 'trends' && (
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
      )}
      
      {/* Custom Report Section */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        marginTop: '24px',
        padding: '16px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Generate Custom Cost Reports</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            padding: '16px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            cursor: 'pointer',
            backgroundColor: '#f9fafb'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Service Cost Breakdown</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Detailed breakdown of costs by AWS service with month-over-month comparison</p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            cursor: 'pointer',
            backgroundColor: '#f9fafb'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Resource Utilization</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>CPU, memory, and storage utilization metrics correlated with costs</p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            cursor: 'pointer',
            backgroundColor: '#f9fafb'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Tag-Based Analysis</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>View costs filtered by tags (projects, teams, environments)</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            Create Custom Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default Insights;