// src/components/cost-analysis/CostBreakdownChart.js
import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend
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
  if (!data || !data.labels || !data.values) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Combine small segments into "Other" for better visualization
  const threshold = 0.03; // 3% threshold
  const total = data.values.reduce((sum, value) => sum + value, 0);
  
  let labels = [...data.labels];
  let values = [...data.values];
  let colors = [...CHART_COLORS];

  // Process the data to combine small segments
  if (labels.length > 10) {
    const sortedData = data.labels.map((label, index) => ({
      label,
      value: data.values[index]
    })).sort((a, b) => b.value - a.value);
    
    // Take top 9 items and combine the rest
    const topItems = sortedData.slice(0, 9);
    const otherItems = sortedData.slice(9);
    
    if (otherItems.length > 0) {
      const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
      
      labels = topItems.map(item => item.label);
      labels.push('Other');
      
      values = topItems.map(item => item.value);
      values.push(otherValue);
      
      // Use only the colors we need
      colors = CHART_COLORS.slice(0, labels.length);
    }
  } else {
    // Use only the colors we need
    colors = CHART_COLORS.slice(0, labels.length);
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace(', 0.8)', ', 1)')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
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
    <div className="relative h-full">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
        <div className="text-center">
          <div className="text-sm text-gray-500">{getTitle()}</div>
          <div className="text-lg font-semibold text-gray-700">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(total)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownChart;