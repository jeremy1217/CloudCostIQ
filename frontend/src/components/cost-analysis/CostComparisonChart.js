// src/components/cost-analysis/CostComparisonChart.js
import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const CostComparisonChart = ({ data, timeRange }) => {
  if (!data || !data.labels || !data.datasets) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Determine the comparison type based on the time range
  let comparisonType = 'Month';
  if (timeRange === '1y') {
    comparisonType = 'Year';
  } else if (timeRange === '7d') {
    comparisonType = 'Week';
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: `Current ${comparisonType}`,
        data: data.datasets.current,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
      },
      {
        label: `Previous ${comparisonType}`,
        data: data.datasets.previous,
        backgroundColor: 'rgba(156, 163, 175, 0.7)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumSignificantDigits: 3
            }).format(value);
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default CostComparisonChart;