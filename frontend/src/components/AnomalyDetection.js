import React, { useState, useEffect } from 'react';
// import axios from 'axios';  // Uncomment when ready for API calls

function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sensitivity, setSensitivity] = useState('medium');
  const [timeRange, setTimeRange] = useState('30');
  const [selectedServices, setSelectedServices] = useState(['all']);
  const [detectionThreshold, setDetectionThreshold] = useState({
    deviationPercent: 30,
    minImpact: 100
  });
  
  // Mock data - replace with API call in production
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      const mockAnomalies = [
        {
          id: 1,
          timestamp: '2025-02-28T14:23:12Z',
          service: 'EC2',
          region: 'us-east-1',
          resourceId: 'i-0abc123def456',
          description: 'Sudden 245% increase in compute usage',
          baseCost: 123.45,
          anomalyCost: 425.89,
          deviation: 245,
          status: 'open',
          confidence: 'high',
          pattern: 'spike',
          resourceGroup: 'production',
          tags: { 'environment': 'production', 'project': 'web-app' }
        },
        {
          id: 2,
          timestamp: '2025-02-27T08:12:45Z',
          service: 'S3',
          region: 'us-west-2',
          resourceId: 'customer-data-bucket',
          description: 'Unusual data transfer pattern',
          baseCost: 56.78,
          anomalyCost: 178.92,
          deviation: 215,
          status: 'investigating',
          confidence: 'medium',
          pattern: 'sustained',
          resourceGroup: 'data-storage',
          tags: { 'environment': 'production', 'data-classification': 'customer' }
        },
        {
          id: 3,
          timestamp: '2025-02-26T22:05:31Z',
          service: 'RDS',
          region: 'eu-west-1',
          resourceId: 'db-cluster-001',
          description: 'Database storage cost spike',
          baseCost: 234.56,
          anomalyCost: 389.12,
          deviation: 66,
          status: 'resolved',
          confidence: 'high',
          pattern: 'spike',
          resourceGroup: 'database',
          tags: { 'environment': 'staging', 'team': 'backend' }
        },
        {
          id: 4,
          timestamp: '2025-02-25T16:32:18Z',
          service: 'Lambda',
          region: 'us-east-2',
          resourceId: 'data-processor-function',
          description: 'Excessive function execution time',
          baseCost: 45.23,
          anomalyCost: 167.89,
          deviation: 271,
          status: 'open',
          confidence: 'high',
          pattern: 'recurring',
          resourceGroup: 'serverless',
          tags: { 'environment': 'production', 'team': 'data-science' }
        },
        {
          id: 5,
          timestamp: '2025-02-24T09:45:22Z',
          service: 'CloudFront',
          region: 'global',
          resourceId: 'distribution-001',
          description: 'Unusual data transfer to Asia Pacific',
          baseCost: 89.67,
          anomalyCost: 156.34,
          deviation: 74,
          status: 'dismissed',
          confidence: 'low',
          pattern: 'gradual',
          resourceGroup: 'content-delivery',
          tags: { 'environment': 'production', 'product': 'media-service' }
        },
        {
          id: 6,
          timestamp: '2025-02-23T11:28:42Z',
          service: 'EC2',
          region: 'ap-southeast-1',
          resourceId: 'i-0def456abc789',
          description: 'Instance running in non-business hours',
          baseCost: 67.89,
          anomalyCost: 112.45,
          deviation: 65,
          status: 'resolved',
          confidence: 'medium',
          pattern: 'recurring',
          resourceGroup: 'development',
          tags: { 'environment': 'development', 'team': 'frontend' }
        },
      ];
      
      setAnomalies(mockAnomalies);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter anomalies based on sensitivity, time range, and selected services
  const filteredAnomalies = anomalies.filter(anomaly => {
    // Filter by sensitivity
    if (sensitivity === 'low' && anomaly.deviation < 100) return false;
    if (sensitivity === 'medium' && anomaly.deviation < 50) return false;
    if (sensitivity === 'high' && anomaly.deviation < 20) return false;
    
    // Filter by service
    if (!selectedServices.includes('all') && !selectedServices.includes(anomaly.service.toLowerCase())) {
      return false;
    }
    
    // We'd normally filter by time range here too, but since our mock data is limited,
    // we'll include all for demo purposes
    
    return true;
  });
  
  // Group and sort anomalies
  const sortedAnomalies = [...filteredAnomalies].sort((a, b) => {
    // Primary sort by status (open first)
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    
    // Then by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Available services for filtering
  const services = [
    { id: 'all', name: 'All Services' },
    { id: 'ec2', name: 'EC2' },
    { id: 's3', name: 'S3' },
    { id: 'rds', name: 'RDS' },
    { id: 'lambda', name: 'Lambda' },
    { id: 'cloudfront', name: 'CloudFront' },
    { id: 'other', name: 'Other Services' }
  ];
  
  const handleServiceChange = (serviceId) => {
    if (serviceId === 'all') {
      // If "All Services" is selected, clear other selections
      setSelectedServices(['all']);
    } else {
      // If a specific service is selected, remove "All Services" and toggle the service
      const newSelectedServices = selectedServices.filter(id => id !== 'all');
      
      if (newSelectedServices.includes(serviceId)) {
        // If already selected, remove it
        setSelectedServices(newSelectedServices.filter(id => id !== serviceId));
        
        // If no services selected, default back to "All Services"
        if (newSelectedServices.length === 1) {
          setSelectedServices(['all']);
        }
      } else {
        // If not selected, add it
        setSelectedServices([...newSelectedServices, serviceId]);
      }
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get badge color based on status
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'open':
        return {
          background: '#fee2e2', // light red
          text: '#b91c1c', // darker red
        };
      case 'investigating':
        return {
          background: '#fef3c7', // light yellow
          text: '#b45309', // darker yellow/orange
        };
      case 'resolved':
        return {
          background: '#d1fae5', // light green
          text: '#047857', // darker green
        };
      case 'dismissed':
        return {
          background: '#f3f4f6', // light gray
          text: '#6b7280', // darker gray
        };
      default:
        return {
          background: '#e0f2fe', // light blue
          text: '#0369a1', // darker blue
        };
    }
  };
  
  // Get color for the deviation indicator
  const getDeviationColor = (deviation) => {
    if (deviation >= 100) return '#dc2626'; // High deviation - red
    if (deviation >= 50) return '#ea580c'; // Medium deviation - orange
    return '#ca8a04'; // Lower deviation - yellow
  };
  
  // Get the anomaly impact in dollars
  const getAnomalyImpact = (anomaly) => {
    return anomaly.anomalyCost - anomaly.baseCost;
  };
  
  // Calculate total impact of all detected anomalies
  const totalImpact = filteredAnomalies.reduce((sum, anomaly) => {
    // Only include open and investigating anomalies
    if (anomaly.status === 'open' || anomaly.status === 'investigating') {
      return sum + getAnomalyImpact(anomaly);
    }
    return sum;
  }, 0);
  
  // Update detection threshold settings
  const handleThresholdUpdate = () => {
    // In a real app, this would call an API to update the settings
    alert(`Detection settings updated: ${detectionThreshold.deviationPercent}% deviation threshold, $${detectionThreshold.minImpact} minimum impact`);
  };
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Anomaly Detection</h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ 
            padding: '8px 12px', 
            backgroundColor: 'white', 
            border: '1px solid #d1d5db', 
            borderRadius: '6px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>Configure Alerts</span>
          </button>
          <button style={{ 
            padding: '8px 12px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            Run Detection Now
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          padding: '16px' 
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Active Anomalies</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {filteredAnomalies.filter(a => a.status === 'open' || a.status === 'investigating').length}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            From {filteredAnomalies.length} detected
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          padding: '16px' 
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Estimated Impact</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            ${totalImpact.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            Potential excess cost
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          padding: '16px' 
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Most Affected Service</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {
              Object.entries(
                filteredAnomalies.reduce((acc, anomaly) => {
                  const service = anomaly.service;
                  acc[service] = (acc[service] || 0) + getAnomalyImpact(anomaly);
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
            }
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            By cost impact
          </p>
        </div>
      </div>
      
      {/* Control panel */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
            Detection Sensitivity
          </label>
          <select 
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db', 
              minWidth: '150px' 
            }}
          >
            <option value="low">Low (Major spikes only)</option>
            <option value="medium">Medium (Default)</option>
            <option value="high">High (Detect subtle changes)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
            Time Range
          </label>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db', 
              minWidth: '150px' 
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
            Services
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => handleServiceChange(service.id)}
                style={{ 
                  padding: '4px 10px', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  backgroundColor: selectedServices.includes(service.id) ? '#3b82f6' : 'white',
                  color: selectedServices.includes(service.id) ? 'white' : '#4b5563',
                }}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading anomaly data...</p>
        </div>
      ) : (
        <>
          {/* Anomalies List */}
          <div style={{ marginBottom: '24px' }}>
            {sortedAnomalies.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#6b7280' }}>No anomalies detected with current filter settings.</p>
              </div>
            ) : (
              <div>
                {sortedAnomalies.map(anomaly => (
                  <div 
                    key={anomaly.id}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      padding: '16px 0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{anomaly.service} Anomaly</h3>
                        <div style={{ 
                          padding: '2px 8px', 
                          borderRadius: '9999px',
                          fontSize: '12px',
                          ...getStatusColor(anomaly.status)
                        }}>
                          {anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1)}
                        </div>
                        
                        <div style={{ 
                          padding: '2px 8px', 
                          borderRadius: '9999px',
                          fontSize: '12px',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563'
                        }}>
                          {anomaly.pattern.charAt(0).toUpperCase() + anomaly.pattern.slice(1)}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: getDeviationColor(anomaly.deviation) }}>
                            +{anomaly.deviation}%
                          </span>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>deviation</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          {formatDate(anomaly.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                      {anomaly.description} in {anomaly.resourceId} ({anomaly.region})
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginTop: '8px',
                      fontSize: '14px'
                    }}>
                      <div>
                        <span style={{ color: '#6b7280' }}>Base cost: </span>
                        <span style={{ fontWeight: '500' }}>${anomaly.baseCost.toFixed(2)}</span>
                        <span style={{ color: '#6b7280', marginLeft: '12px' }}>Anomaly cost: </span>
                        <span style={{ fontWeight: '500', color: '#dc2626' }}>${anomaly.anomalyCost.toFixed(2)}</span>
                        <span style={{ color: '#6b7280', marginLeft: '12px' }}>Impact: </span>
                        <span style={{ fontWeight: '500', color: '#dc2626' }}>${getAnomalyImpact(anomaly).toFixed(2)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {anomaly.status === 'open' && (
                          <>
                            <button style={{ 
                              padding: '4px 10px', 
                              backgroundColor: 'white', 
                              border: '1px solid #d1d5db', 
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              Dismiss
                            </button>
                            <button style={{ 
                              padding: '4px 10px', 
                              backgroundColor: '#2563eb', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              Investigate
                            </button>
                          </>
                        )}
                        {anomaly.status !== 'open' && (
                          <button style={{ 
                            padding: '4px 10px', 
                            backgroundColor: 'white', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Detection Settings */}
          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Detection Settings</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
                  Deviation Threshold %
                </label>
                <input 
                  type="number"
                  value={detectionThreshold.deviationPercent}
                  onChange={(e) => setDetectionThreshold({...detectionThreshold, deviationPercent: parseInt(e.target.value)})}
                  min="5"
                  max="200"
                  style={{ 
                    padding: '8px', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db', 
                    width: '100px' 
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
                  Minimum $ Impact
                </label>
                <input 
                  type="number"
                  value={detectionThreshold.minImpact}
                  onChange={(e) => setDetectionThreshold({...detectionThreshold, minImpact: parseInt(e.target.value)})}
                  min="0"
                  step="10"
                  style={{ 
                    padding: '8px', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db', 
                    width: '100px' 
                  }}
                />
              </div>
            </div>
            
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              <p>Our anomaly detection system uses machine learning to identify unusual spending patterns 
              in your cloud resources. Adjust the sensitivity settings above to fine-tune detection.</p>
            </div>
            
            <button 
              onClick={handleThresholdUpdate}
              style={{ 
                padding: '8px 12px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              Update Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AnomalyDetection;