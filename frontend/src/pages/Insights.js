import React, { useState, lazy, Suspense } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';

// Lazy load tab components
const RecommendationsTab = lazy(() => import('../components/insights/RecommendationsTab'));
const AnomaliesTab = lazy(() => import('../components/insights/AnomaliesTab'));
const TrendsTab = lazy(() => import('../components/insights/TrendsTab'));

function Insights() {
  const [activeTab, setActiveTab] = useState('recommendations');
  
  // Mock data for insights
  const recommendations = [
    // ... Your existing recommendations data
  ];
  
  const anomalies = [
    // ... Your existing anomalies data
  ];
  
  const trends = [
    // ... Your existing trends data
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
        {/* ... Summary cards (Keep these in the main component) ... */}
        {/* This part remains unchanged */}
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
      
      {/* Tab Content - Lazy loaded */}
      {activeTab === 'recommendations' && (
        <Suspense fallback={<LoadingIndicator message="Loading recommendations..." />}>
          <RecommendationsTab 
            recommendations={recommendations} 
            formatDollar={formatDollar}
            getBadgeColor={getBadgeColor}
            expandedCard={expandedCard}
            setExpandedCard={setExpandedCard}
          />
        </Suspense>
      )}
      
      {activeTab === 'anomalies' && (
        <Suspense fallback={<LoadingIndicator message="Loading anomalies..." />}>
          <AnomaliesTab 
            anomalies={anomalies} 
            getBadgeColor={getBadgeColor}
            getStatusColor={getStatusColor}
          />
        </Suspense>
      )}
      
      {activeTab === 'trends' && (
        <Suspense fallback={<LoadingIndicator message="Loading trends..." />}>
          <TrendsTab trends={trends} />
        </Suspense>
      )}
      
      {/* Custom Report Section */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        marginTop: '24px',
        padding: '16px'
      }}>
        {/* ... Custom report section (Keep this in the main component) ... */}
        {/* This part remains unchanged */}
      </div>
    </div>
  );
}

export default Insights;