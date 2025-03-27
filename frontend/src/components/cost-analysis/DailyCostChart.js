// src/components/cost-analysis/DailyCostChart.js
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

const DailyCostChart = ({ data }) => {
  if (!data || !data.dates || !data.costs) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Generate background colors for weekday/weekend
  const backgroundColors = data.dates.map(date => {
    const dayOfWeek = new Date(date).getDay();
    // Weekend (0 = Sunday, 6 = Saturday)
    return dayOfWeek === 0 || dayOfWeek === 6 
      ? 'rgba(79, 70, 229, 0.5)'  // lighter indigo for weekends
      : 'rgba(79, 70, 229, 0.8)'; // darker indigo for weekdays
  });

  const chartData = {
    labels: data.dates.map(date => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Daily Cost',
        data: data.costs,
        backgroundColor: backgroundColors,
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const date = new Date(data.dates[tooltipItems[0].dataIndex]);
            return date.toLocaleDateString(undefined, { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          },
          label: function(context) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.raw);
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

export default DailyCostChart;