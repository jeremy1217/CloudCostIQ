// src/components/cost-analysis/CostBreakdownChart.js
import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Define color palette for the chart
const CHART_COLORS = [
  'rgba(79, 70, 229, 0.8)',   // indigo
  'rgba(59, 130, 246, 0.8)',  // blue
  'rgba(16, 185, 129, 0.8)',  // green
  'rgba(245, 158, 11, 0.8)',  // amber
  'rgba(239, 68, 68, 0.8)',   // red
  'rgba(139, 92, 246, 0.8)',  // purple
  'rgba(236, 72, 153, 0.8)',  // pink
  'rgba(14, 165, 233, 0.8)',  // sky
  'rgba(20, 184, 166, 0.8)',  // teal
  'rgba(234, 88, 12, 0.8)',   // orange
];

const CostBreakdownChart = ({ data, groupBy }) => {
  const [chartType, setChartType] = useState('doughnut'); // 'doughnut' or 'bar'
  const [processedData, setProcessedData] = useState({
    labels: [],
    values: [],
    colors: [],
    previousValues: []
  });
  
  // Process data when it changes
  useEffect(() => {
    if (!data || !data.labels || !data.values) return;
    
    // Combine small segments into "Other" for better visualization
    const threshold = 0.03; // 3% threshold
    const total = data.values.reduce((sum, value) => sum + value, 0);
    
    let labels = [...data.labels];
    let values = [...data.values];
    let previousValues = data.previousValues ? [...data.previousValues] : [];
    let colors = [...CHART_COLORS];

    // Process the data to combine small segments
    if (labels.length > 10) {
      const sortedData = data.labels.map((label, index) => ({
        label,
        value: data.values[index],
        previousValue: data.previousValues ? data.previousValues[index] : 0
      })).sort((a, b) => b.value - a.value);
      
      // Take top 9 items and combine the rest
      const topItems = sortedData.slice(0, 9);
      const otherItems = sortedData.slice(9);
      
      if (otherItems.length > 0) {
        const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
        const otherPreviousValue = otherItems.reduce((sum, item) => sum + (item.previousValue || 0), 0);
        
        labels = topItems.map(item => item.label);
        labels.push('Other');
        
        values = topItems.map(item => item.value);
        values.push(otherValue);
        
        if (previousValues.length > 0) {
          previousValues = topItems.map(item => item.previousValue || 0);
          previousValues.push(otherPreviousValue);
        }
        
        // Use only the colors we need
        colors = CHART_COLORS.slice(0, labels.length);
      }
    } else {
      // Use only the colors we need
      colors = CHART_COLORS.slice(0, labels.length);
    }

    setProcessedData({
      labels,
      values,
      colors,
      previousValues: previousValues.length > 0 ? previousValues : []
    });
  }, [data]);

  if (!data || !data.labels || !data.values) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const total = processedData.values.reduce((sum, value) => sum + value, 0);

  // Prepare doughnut chart data
  const doughnutChartData = {
    labels: processedData.labels,
    datasets: [
      {
        data: processedData.values,
        backgroundColor: processedData.colors,
        borderColor: processedData.colors.map(color => color.replace(', 0.8)', ', 1)')),
        borderWidth: 1,
        hoverOffset: 10
      },
    ],
  };

  // Prepare bar chart data for comparison (if previous values exist)
  const barChartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: 'Current Period',
        data: processedData.values,
        backgroundColor: processedData.colors,
        borderColor: processedData.colors.map(color => color.replace(', 0.8)', ', 1)')),
        borderWidth: 1,
      }
    ]
  };

  // Add previous period data if available
  if (processedData.previousValues.length > 0) {
    barChartData.datasets.push({
      label: 'Previous Period',
      data: processedData.previousValues,
      backgroundColor: processedData.colors.map(color => color.replace(', 0.8)', ', 0.3)')),
      borderColor: processedData.colors.map(color => color.replace(', 0.8)', ', 0.6)')),
      borderWidth: 1,
    });
  }

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: isNaN(data.datasets[0].data[i]),
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
      easing: 'easeOutQuart'
    }
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',  // Horizontal bar chart
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `${context.dataset.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
  };

  // Format the title based on groupBy
  const getTitle = () => {
    switch (groupBy) {
      case 'service':
        return 'Cost by Service';
      case 'account':
        return 'Cost by Account';
      case 'region':
        return 'Cost by Region';
      case 'tag':
        return 'Cost by Tag';
      default:
        return 'Cost Breakdown';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart type toggle */}
      <div className="flex justify-end mb-3">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setChartType('doughnut')}
            className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
              chartType === 'doughnut' 
                ? 'bg-primary-50 text-primary-600 border-primary-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } transition-colors duration-200`}
          >
            Doughnut
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-xs font-medium rounded-r-md border ${
              chartType === 'bar' 
                ? 'bg-primary-50 text-primary-600 border-primary-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } transition-colors duration-200`}
          >
            Bar
          </button>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="flex-1 relative">
        {chartType === 'doughnut' ? (
          <>
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
              <div className="text-center">
                <div className="text-sm text-gray-500">{getTitle()}</div>
                <div className="text-lg font-semibold text-gray-700">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                  }).format(total)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <Bar data={barChartData} options={barOptions} />
        )}
      </div>
      
      {/* Optional summary section */}
      {processedData.previousValues.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          {(() => {
            const currentTotal = processedData.values.reduce((sum, val) => sum + val, 0);
            const previousTotal = processedData.previousValues.reduce((sum, val) => sum + val, 0);
            
            if (previousTotal === 0) return null;
            
            const percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
            const isPositive = percentChange > 0;
            const isNegative = percentChange < 0;
            
            return (
              <span className="inline-flex items-center">
                <span>Total change from previous period:</span>
                <span className={`ml-1 font-medium ${
                  isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isPositive ? '↑' : isNegative ? '↓' : '→'}
                  {Math.abs(percentChange).toFixed(1)}%
                </span>
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CostBreakdownChart;