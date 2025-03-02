import React, { useState, useEffect } from 'react';
// import axios from 'axios';  // Uncomment when ready for API calls

function CostAttribution() {
  const [costData, setCostData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [attributionType, setAttributionType] = useState('team');
  const [untaggedResources, setUntaggedResources] = useState([]);
  const [showUntagged, setShowUntagged] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  
  // Mock data - replace with API call in production
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      // Team attribution data
      const teamData = [
        { id: 1, name: 'Engineering', cost: 28456.78, percentChange: 5.7, increasing: true, resources: 126 },
        { id: 2, name: 'DevOps', cost: 15687.92, percentChange: -2.3, increasing: false, resources: 78 },
        { id: 3, name: 'Data Science', cost: 12345.67, percentChange: 8.2, increasing: true, resources: 54 },
        { id: 4, name: 'Frontend', cost: 9876.54, percentChange: 1.5, increasing: true, resources: 32 },
        { id: 5, name: 'Backend', cost: 8765.43, percentChange: -0.8, increasing: false, resources: 41 },
        { id: 6, name: 'QA', cost: 6543.21, percentChange: 3.1, increasing: true, resources: 28 },
        { id: 7, name: 'Admin', cost: 4321.09, percentChange: -4.2, increasing: false, resources: 19 }
      ];
      
      // Project attribution data
      const projectData = [
        { id: 1, name: 'Customer Portal', cost: 18765.43, percentChange: 4.2, increasing: true, resources: 87 },
        { id: 2, name: 'Data Pipeline', cost: 16543.21, percentChange: 9.8, increasing: true, resources: 64 },
        { id: 3, name: 'Mobile App', cost: 12345.67, percentChange: -1.5, increasing: false, resources: 41 },
        { id: 4, name: 'Internal Tools', cost: 9876.54, percentChange: 0.7, increasing: true, resources: 35 },
        { id: 5, name: 'Legacy Migration', cost: 8765.43, percentChange: -6.3, increasing: false, resources: 28 },
        { id: 6, name: 'Marketplace', cost: 7654.32, percentChange: 3.8, increasing: true, resources: 32 },
        { id: 7, name: 'Analytics Platform', cost: 6543.21, percentChange: 5.2, increasing: true, resources: 24 }
      ];
      
      // Environment attribution data
      const environmentData = [
        { id: 1, name: 'Production', cost: 45678.90, percentChange: 3.4, increasing: true, resources: 156 },
        { id: 2, name: 'Staging', cost: 23456.78, percentChange: 1.8, increasing: true, resources: 89 },
        { id: 3, name: 'Development', cost: 12345.67, percentChange: -2.1, increasing: false, resources: 67 },
        { id: 4, name: 'QA', cost: 5678.90, percentChange: -4.5, increasing: false, resources: 42 }
      ];
      
      // Cost center attribution data
      const costCenterData = [
        { id: 1, name: 'Engineering', cost: 34567.89, percentChange: 2.8, increasing: true, resources: 142 },
        { id: 2, name: 'Product', cost: 23456.78, percentChange: 5.6, increasing: true, resources: 98 },
        { id: 3, name: 'Marketing', cost: 12345.67, percentChange: -1.2, increasing: false, resources: 45 },
        { id: 4, name: 'Sales', cost: 8765.43, percentChange: 3.5, increasing: true, resources: 32 },
        { id: 5, name: 'Finance', cost: 6543.21, percentChange: -0.7, increasing: false, resources: 26 },
        { id: 6, name: 'HR', cost: 3456.78, percentChange: 1.1, increasing: true, resources: 14 }
      ];
      
      // Untagged resources data
      const untaggedResourcesData = [
        { id: 'i-abc12345', type: 'EC2 Instance', cost: 567.89, age: 45 },
        { id: 'vol-def67890', type: 'EBS Volume', cost: 123.45, age: 67 },
        { id: 'eni-ghi12345', type: 'Network Interface', cost: 45.67, age: 32 },
        { id: 'nat-jkl67890', type: 'NAT Gateway', cost: 234.56, age: 89 },
        { id: 'sg-mno12345', type: 'Security Group', cost: 0, age: 123 },
        { id: 'snap-pqr67890', type: 'EBS Snapshot', cost: 78.90, age: 45 },
        { id: 'lb-stu12345', type: 'Load Balancer', cost: 345.67, age: 56 }
      ];
      
      const attributionMap = {
        'team': teamData,
        'project': projectData,
        'environment': environmentData,
        'costCenter': costCenterData
      };
      
      setCostData(attributionMap[attributionType]);
      setUntaggedResources(untaggedResourcesData);
      setIsLoading(false);
      
      // Set active tags based on attribution type
      const allTags = [
        { id: 'team', name: 'Team', active: attributionType === 'team' },
        { id: 'project', name: 'Project', active: attributionType === 'project' },
        { id: 'environment', name: 'Environment', active: attributionType === 'environment' },
        { id: 'costCenter', name: 'Cost Center', active: attributionType === 'costCenter' }
      ];
      setActiveTags(allTags);
      
    }, 1000);
  }, [attributionType]);
  
  // Calculate total cost
  const totalCost = costData.reduce((sum, item) => sum + item.cost, 0);
  
  // Calculate untagged resources total cost
  const untaggedCost = untaggedResources.reduce((sum, item) => sum + item.cost, 0);
  
  // Calculate untagged percentage
  const untaggedPercentage = (untaggedCost / (totalCost + untaggedCost)) * 100;
  
  // Function to generate background colors for cost bars
  const getBackgroundColor = (index) => {
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f97316', // orange
      '#14b8a6', // teal
      '#84cc16', // lime
      '#06b6d4', // cyan
      '#f43f5e', // rose
      '#6366f1', // indigo
      '#10b981'  // emerald
    ];
    
    return colors[index % colors.length];
  };
  
  // Handle attribution type change
  const handleAttributionChange = (type) => {
    setAttributionType(type);
    setIsLoading(true); // Trigger loading state for new data
  };
  
  // Handle tag click to change attribution type
  const handleTagClick = (tagId) => {
    handleAttributionChange(tagId);
  };
  
  // Format percentage change
  const formatPercentChange = (change, increasing) => {
    return `${increasing ? '+' : ''}${change}%`;
  };
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Cost Attribution Analysis</h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <button style={{ 
            padding: '8px 12px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Tag selection */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        marginBottom: '20px' 
      }}>
        {activeTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: attributionType === tag.id ? '#2563eb' : 'white',
              color: attributionType === tag.id ? 'white' : '#4b5563',
              fontSize: '14px',
              fontWeight: attributionType === tag.id ? 'bold' : 'normal'
            }}
          >
            {tag.name}
          </button>
        ))}
        
        <button
          onClick={() => setShowUntagged(!showUntagged)}
          style={{ 
            padding: '6px 12px', 
            borderRadius: '6px',
            border: '1px solid #fee2e2',
            backgroundColor: showUntagged ? '#fef2f2' : 'white',
            color: '#b91c1c',
            fontSize: '14px',
            marginLeft: 'auto'
          }}
        >
          {showUntagged ? 'Hide' : 'Show'} Untagged Resources (${untaggedCost.toLocaleString()})
        </button>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading attribution data...</p>
        </div>
      ) : (
        <>
          {/* Cost breakdown visualization */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              {attributionType === 'team' && 'Cost by Team'}
              {attributionType === 'project' && 'Cost by Project'}
              {attributionType === 'environment' && 'Cost by Environment'}
              {attributionType === 'costCenter' && 'Cost by Cost Center'}
            </h3>
            
            {/* Chart placeholder - would be replaced with actual chart component */}
            <div style={{ 
              height: '300px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#6b7280' }}>Cost Attribution Chart Would Render Here</p>
            </div>
          </div>
          
          {/* Cost breakdown table */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Cost Breakdown</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Total: ${totalCost.toLocaleString()}
              </p>
            </div>
            
            <div>
              {costData.map((item, index) => (
                <div 
                  key={item.id}
                  style={{ 
                    padding: '12px 0', 
                    borderBottom: index < costData.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '500' }}>{item.name}</p>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                        {item.resources} resources • 
                        <span style={{ 
                          color: item.increasing ? '#dc2626' : '#16a34a',
                          marginLeft: '4px'
                        }}>
                          {formatPercentChange(item.percentChange, item.increasing)}
                        </span>
                        <span style={{ marginLeft: '4px' }}>vs previous {timeRange}</span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '15px', fontWeight: '500' }}>${item.cost.toLocaleString()}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                        {((item.cost / totalCost) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  
                  {/* Cost bar */}
                  <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${(item.cost / totalCost) * 100}%`, 
                        backgroundColor: getBackgroundColor(index),
                        borderRadius: '4px'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Untagged resources */}
          {showUntagged && (
            <div style={{ 
              marginTop: '24px', 
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fee2e2'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#b91c1c' }}>Untagged Resources</h3>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#b91c1c' }}>
                    ${untaggedCost.toLocaleString()} ({untaggedPercentage.toFixed(1)}% of total)
                  </p>
                </div>
              </div>
              
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                These resources do not have proper tags for cost attribution. Consider adding 
                appropriate tags to improve cost visibility.
              </p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(254, 226, 226, 0.5)' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fecaca' }}>Resource ID</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #fecaca' }}>Type</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #fecaca' }}>Cost</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #fecaca' }}>Age (days)</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #fecaca' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {untaggedResources.map((resource, index) => (
                      <tr key={resource.id} style={{ borderBottom: index < untaggedResources.length - 1 ? '1px solid #fecaca' : 'none' }}>
                        <td style={{ padding: '8px' }}>{resource.id}</td>
                        <td style={{ padding: '8px' }}>{resource.type}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>${resource.cost.toLocaleString()}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{resource.age}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <button style={{ 
                            padding: '4px 8px', 
                            backgroundColor: 'white', 
                            border: '1px solid #dc2626', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#dc2626'
                          }}>
                            Add Tags
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#b91c1c', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  Fix Untagged Resources
                </button>
              </div>
            </div>
          )}
          
          {/* Tag Management */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Tag Management</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Required Tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#e0f2fe', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#0369a1'
                  }}>
                    team
                  </span>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#e0f2fe', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#0369a1'
                  }}>
                    project
                  </span>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#e0f2fe', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#0369a1'
                  }}>
                    environment
                  </span>
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Optional Tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#4b5563'
                  }}>
                    cost-center
                  </span>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#4b5563'
                  }}>
                    owner
                  </span>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#4b5563'
                  }}>
                    service
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              <p>Well-defined tagging improves cost visibility and helps with budget allocation. Configure 
              tag enforcement policies to ensure consistent tagging across all resources.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ 
                padding: '8px 12px', 
                backgroundColor: 'white', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                Edit Tag Policies
              </button>
              <button style={{ 
                padding: '8px 12px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                Enable Tag Enforcement
              </button>
            </div>
          </div>
          
          {/* Custom Report Options */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Custom Reports</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                backgroundColor: 'white'
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>Team Cost Allocation</h4>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Detailed breakdown of costs by team with historical trend analysis
                </p>
              </div>
              
              <div style={{ 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                backgroundColor: 'white'
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>Project Budget Tracking</h4>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Compare actual vs budgeted spend by project with variance analysis
                </p>
              </div>
              
              <div style={{ 
                padding: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                backgroundColor: 'white'
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>Environment Cost Comparison</h4>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Compare costs across different environments (prod, staging, dev)
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button style={{ 
                padding: '8px 12px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                Generate Custom Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CostAttribution;