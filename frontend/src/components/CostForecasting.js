import React, { useState, useEffect } from 'react';
// import axios from 'axios';  // Uncomment when ready to use for API calls
import { 
  getMockHistoricalCostData, 
  getMockForecastData, 
  linearRegression, 
  formatDate 
} from '../services/mockData';

function CostForecasting() {
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('all');
  const [confidenceLevel, setConfidenceLevel] = useState('medium');
  
  // Fetch data - now using our centralized mock data service
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      const mockHistoricalData = getMockHistoricalCostData(6); // 6 months of data
      setHistoricalData(mockHistoricalData);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Generate forecast whenever historical data or forecast parameters change
  useEffect(() => {
    if (historicalData.length > 0) {
      const forecast = generateForecast(historicalData, forecastMonths);
      setForecastData(forecast);
    }
  }, [historicalData, forecastMonths]);
  
  // Generate forecast data points - using the linearRegression helper from mockData service
  const generateForecast = (data, months) => {
    return getMockForecastData(data, months);
  };
  
  // Calculate confidence interval based on selected level
  const getConfidenceInterval = (cost) => {
    const intervals = {
      low: 0.05,
      medium: 0.10,
      high: 0.20
    };
    
    const margin = cost * intervals[confidenceLevel];
    return {
      lower: cost - margin,
      upper: cost + margin
    };
  };
  
  // All available AWS services for filtering
  const services = [
    { id: 'all', name: 'All Services' },
    { id: 'ec2', name: 'EC2' },
    { id: 's3', name: 'S3' },
    { id: 'rds', name: 'RDS' },
    { id: 'lambda', name: 'Lambda' },
    { id: 'other', name: 'Other Services' }
  ];
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Cost Forecast</h2>
      
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
            Service
          </label>
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db', 
              minWidth: '150px' 
            }}
          >
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
            Forecast Period
          </label>
          <select 
            value={forecastMonths}
            onChange={(e) => setForecastMonths(parseInt(e.target.value))}
            style={{ 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db', 
              minWidth: '150px' 
            }}
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
            Confidence Level
          </label>
          <select 
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(e.target.value)}
            style={{ 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db', 
              minWidth: '150px' 
            }}
          >
            <option value="low">Low (±5%)</option>
            <option value="medium">Medium (±10%)</option>
            <option value="high">High (±20%)</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading forecast data...</p>
        </div>
      ) : (
        <>
          {/* Chart placeholder - would be replaced with actual chart component */}
          <div style={{ 
            height: '300px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '8px', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#6b7280' }}>Cost Forecast Chart Would Render Here</p>
          </div>
          
          {/* Forecast data table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Month</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Projected Cost</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Lower Bound</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Upper Bound</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {/* Historical data (past months) */}
                {historicalData.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{formatDate(item.date)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>${item.cost.toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '9999px',
                        fontSize: '12px',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7'
                      }}>
                        Actual
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Forecast data (future months) */}
                {forecastData.map((item, index) => {
                  const interval = getConfidenceInterval(item.predictedCost);
                  return (
                    <tr key={`forecast-${index}`} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafbfc' }}>
                      <td style={{ padding: '12px' }}>{formatDate(item.date)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>${item.predictedCost.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#047857' }}>${Math.round(interval.lower).toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#b91c1c' }}>${Math.round(interval.upper).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '9999px',
                          fontSize: '12px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e'
                        }}>
                          Forecast
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total 6-Month Actual</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${historicalData.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Forecast ({forecastMonths} mo)</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${forecastData.reduce((sum, item) => sum + item.predictedCost, 0).toLocaleString()}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Monthly Average (Actual)</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${(historicalData.reduce((sum, item) => sum + item.cost, 0) / historicalData.length).toLocaleString()}
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Monthly Average (Forecast)</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${(forecastData.reduce((sum, item) => sum + item.predictedCost, 0) / forecastData.length).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Forecast methodology explanation */}
          <div style={{ marginTop: '24px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>About This Forecast</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
              This forecast uses linear regression based on your historical cost data. The confidence intervals 
              indicate the range where actual costs are likely to fall. For more accurate forecasts, consider 
              enabling advanced forecasting methods that account for seasonality and growth patterns.
            </p>
            <div style={{ marginTop: '12px' }}>
              <button style={{ 
                padding: '8px 12px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                Enable Advanced Forecasting
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CostForecasting;