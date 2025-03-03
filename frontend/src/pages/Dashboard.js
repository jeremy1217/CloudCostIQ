// frontend/src/pages/Dashboard.js
import React, { useState, lazy, Suspense } from 'react';
// Keep imports for Overview Tab content - these need to be directly imported
import CostChart from '../components/CostChart';
import CostTable from '../components/CostTable';
import LoadingIndicator from '../components/LoadingIndicator';

// Lazy load tab components
const CostForecasting = lazy(() => import('../components/CostForecasting'));
const AnomalyDetection = lazy(() => import('../components/AnomalyDetection'));
const CostAttribution = lazy(() => import('../components/CostAttribution'));

function Dashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock summary stats - for the Overview tab
  const costSummary = {
    totalCost: 12498.67,
    prevPeriodCost: 11856.33,
    percentChange: 5.42,
    trendIncreasing: true,
    forecast: 13250.89
  };
  
  const serviceBreakdown = [
    { service: 'EC2', cost: 4587.23, percentChange: 3.2, increasing: true },
    { service: 'S3', cost: 2145.67, percentChange: -1.8, increasing: false },
    { service: 'RDS', cost: 3256.78, percentChange: 8.5, increasing: true },
    { service: 'Lambda', cost: 1234.56, percentChange: 2.3, increasing: true },
    { service: 'Other', cost: 1274.43, percentChange: -0.7, increasing: false }
  ];

  // Render the Overview tab content
  const renderOverviewTab = () => {
    return (
      <>
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
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Cost</p>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>${costSummary.totalCost.toLocaleString()}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '4px', 
                  color: costSummary.trendIncreasing ? '#ef4444' : '#10b981' 
                }}>
                  <span>{costSummary.trendIncreasing ? '↗' : '↘'}</span>
                  <span style={{ fontSize: '14px' }}>{costSummary.percentChange}% vs last {timeRange}</span>
                </div>
              </div>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                padding: '8px', 
                borderRadius: '50%', 
                color: '#3b82f6' 
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
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Compute (EC2)</p>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>${serviceBreakdown[0].cost.toLocaleString()}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '4px', 
                  color: serviceBreakdown[0].increasing ? '#ef4444' : '#10b981' 
                }}>
                  <span>{serviceBreakdown[0].increasing ? '↗' : '↘'}</span>
                  <span style={{ fontSize: '14px' }}>{serviceBreakdown[0].percentChange}% vs last {timeRange}</span>
                </div>
              </div>
              <div style={{ 
                backgroundColor: '#e0e7ff', 
                padding: '8px', 
                borderRadius: '50%', 
                color: '#6366f1' 
              }}>
                EC2
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
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Storage (S3)</p>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>${serviceBreakdown[1].cost.toLocaleString()}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '4px', 
                  color: serviceBreakdown[1].increasing ? '#ef4444' : '#10b981' 
                }}>
                  <span>{serviceBreakdown[1].increasing ? '↗' : '↘'}</span>
                  <span style={{ fontSize: '14px' }}>{serviceBreakdown[1].percentChange}% vs last {timeRange}</span>
                </div>
              </div>
              <div style={{ 
                backgroundColor: '#dcfce7', 
                padding: '8px', 
                borderRadius: '50%', 
                color: '#22c55e' 
              }}>
                S3
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
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Database (RDS)</p>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>${serviceBreakdown[2].cost.toLocaleString()}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '4px', 
                  color: serviceBreakdown[2].increasing ? '#ef4444' : '#10b981' 
                }}>
                  <span>{serviceBreakdown[2].increasing ? '↗' : '↘'}</span>
                  <span style={{ fontSize: '14px' }}>{serviceBreakdown[2].percentChange}% vs last {timeRange}</span>
                </div>
              </div>
              <div style={{ 
                backgroundColor: '#f3e8ff', 
                padding: '8px', 
                borderRadius: '50%', 
                color: '#a855f7' 
              }}>
                RDS
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
            gridColumn: window.innerWidth > 768 ? 'span 2' : 'auto' 
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Cost Trend</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '4px', 
                    color: '#3b82f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '14px' 
                  }}>
                    Bar
                  </button>
                  <button style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    color: '#6b7280', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '14px' 
                  }}>
                    Line
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <CostChart />
              <div style={{ 
                marginTop: '16px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px', 
                textAlign: 'center', 
                fontSize: '14px' 
              }}>
                <div>
                  <p style={{ color: '#6b7280' }}>Average Daily</p>
                  <p style={{ fontWeight: '600' }}>${(costSummary.totalCost / 30).toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }}>Projected</p>
                  <p style={{ fontWeight: '600' }}>${costSummary.forecast.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280' }}>Year-to-Date</p>
                  <p style={{ fontWeight: '600' }}>$97,456.32</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Service Breakdown</h3>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>Pie Chart Placeholder</div>
              </div>
              <div style={{ marginTop: '16px' }}>
                {serviceBreakdown.map((service, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#6b7280'][index] 
                      }}></div>
                      <span>{service.service}</span>
                    </div>
                    <span style={{ fontWeight: '500' }}>${service.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginTop: '20px'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Cost Details</h3>
              <button style={{ fontSize: '14px', color: '#3b82f6' }}>View All</button>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <CostTable />
          </div>
        </div>
        
        {/* Recommendations Section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginTop: '20px'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Cost Optimization Recommendations</h3>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                padding: '16px', 
                border: '1px solid #fdba74', 
                borderRadius: '8px', 
                backgroundColor: '#fff7ed'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight: '600' }}>Idle EC2 Instances</h4>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>3 instances with &lt;5% CPU utilization for past 2 weeks</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Potential Savings</p>
                    <p style={{ fontWeight: 'bold', color: '#16a34a' }}>$345.67/mo</p>
                  </div>
                </div>
                <button style={{ marginTop: '8px', fontSize: '14px', color: '#3b82f6' }}>View Details →</button>
              </div>
            </div>
            
            <div>
              <div style={{ 
                padding: '16px', 
                border: '1px solid #93c5fd', 
                borderRadius: '8px', 
                backgroundColor: '#eff6ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight: '600' }}>Reserved Instance Opportunity</h4>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>5 instances eligible for RI pricing</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Potential Savings</p>
                    <p style={{ fontWeight: 'bold', color: '#16a34a' }}>$1,245.89/mo</p>
                  </div>
                </div>
                <button style={{ marginTop: '8px', fontSize: '14px', color: '#3b82f6' }}>View Details →</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Cloud Cost Dashboard</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setTimeRange('week')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                backgroundColor: timeRange === 'week' ? 'white' : 'transparent',
                boxShadow: timeRange === 'week' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                backgroundColor: timeRange === 'month' ? 'white' : 'transparent',
                boxShadow: timeRange === 'month' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('quarter')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                backgroundColor: timeRange === 'quarter' ? 'white' : 'transparent',
                boxShadow: timeRange === 'quarter' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Quarter
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '6px',
                backgroundColor: timeRange === 'year' ? 'white' : 'transparent',
                boxShadow: timeRange === 'year' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Year
            </button>
          </div>
          
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            color: '#4b5563', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            padding: '8px 12px' 
          }}>
            <span>Filters</span>
          </button>
          
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            color: '#4b5563', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px', 
            padding: '8px 12px' 
          }}>
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Main Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
            color: activeTab === 'overview' ? '#2563eb' : '#4b5563',
            borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : 'none'
          }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('forecasting')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: activeTab === 'forecasting' ? 'bold' : 'normal',
            color: activeTab === 'forecasting' ? '#2563eb' : '#4b5563',
            borderBottom: activeTab === 'forecasting' ? '2px solid #2563eb' : 'none'
          }}
        >
          Cost Forecasting
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
          Anomaly Detection
        </button>
        <button 
          onClick={() => setActiveTab('attribution')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: activeTab === 'attribution' ? 'bold' : 'normal',
            color: activeTab === 'attribution' ? '#2563eb' : '#4b5563',
            borderBottom: activeTab === 'attribution' ? '2px solid #2563eb' : 'none'
          }}
        >
          Cost Attribution
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      
      {activeTab === 'forecasting' && (
        <Suspense fallback={<LoadingIndicator message="Loading forecasting..." />}>
          <CostForecasting />
        </Suspense>
      )}
      
      {activeTab === 'anomalies' && (
        <Suspense fallback={<LoadingIndicator message="Loading anomaly detection..." />}>
          <AnomalyDetection />
        </Suspense>
      )}
      
      {activeTab === 'attribution' && (
        <Suspense fallback={<LoadingIndicator message="Loading cost attribution..." />}>
          <CostAttribution />
        </Suspense>
      )}
    </div>
  );
}

export default Dashboard;