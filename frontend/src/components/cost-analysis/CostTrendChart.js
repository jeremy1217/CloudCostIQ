// src/components/cost-analysis/CostTrendChart.js
import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const CostTrendChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Total Cost',
        data: data.datasets.totalCost,
        borderColor: 'rgba(79, 70, 229, 1)', // Indigo color
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Previous Period',
        data: data.datasets.previousPeriod,
        borderColor: 'rgba(156, 163, 175, 1)', // Gray color
        backgroundColor: 'rgba(156, 163, 175, 0)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: 'rgba(156, 163, 175, 1)',
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgba(156, 163, 175, 1)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          },
          // Add percentage change vs previous period
          afterBody: function(tooltipItems) {
            if (tooltipItems.length < 2) return [];
            
            const currentValue = tooltipItems[0].parsed.y;
            const previousValue = tooltipItems[1].parsed.y;
            
            if (previousValue === 0) return [];
            
            const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
            const formattedPercentage = new Intl.NumberFormat('en-US', {
              style: 'percent',
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
              signDisplay: 'always'
            }).format(percentageChange / 100);
            
            return [`Change: ${formattedPercentage}`];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 10
          },
          color: '#9CA3AF'
        }
      },
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: 'rgba(243, 244, 246, 1)',
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#9CA3AF',
          padding: 8,
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    },
    elements: {
      line: {
        cubicInterpolationMode: 'monotone'
      }
    }
  };

  // Add annotations to highlight important data points
  if (data.datasets.totalCost && data.datasets.totalCost.length > 0) {
    // Find max and min values
    const values = [...data.datasets.totalCost];
    const maxValue = Math.max(...values);
    const maxIndex = values.indexOf(maxValue);
    
    const minValue = Math.min(...values.filter(v => v > 0)); // Find min non-zero value
    const minIndex = values.indexOf(minValue);
    
    // Only add annotations if we have meaningful max/min
    if (maxValue > 0 && maxIndex !== minIndex) {
      options.plugins.annotation = {
        annotations: {
          maxValueLine: {
            type: 'line',
            yMin: maxValue,
            yMax: maxValue,
            borderColor: 'rgba(239, 68, 68, 0.5)', // Red color
            borderWidth: 1,
            borderDash: [4, 4],
            label: {
              display: true,
              content: 'Highest: $' + maxValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              position: 'end',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'rgb(239, 68, 68)',
              font: {
                size: 10
              },
              padding: 4
            }
          }
        }
      };
    }
  }

  return (
    <div className="relative">
      <Line data={chartData} options={options} />
      {/* Optional annotations or overlays can go here */}
      {data.datasets.totalCost && data.datasets.previousPeriod && (
        <div className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-md p-2 text-xs text-gray-700">
          {(() => {
            // Calculate overall trend
            const currentTotal = data.datasets.totalCost.reduce((sum, val) => sum + val, 0);
            const previousTotal = data.datasets.previousPeriod.reduce((sum, val) => sum + val, 0);
            
            if (previousTotal === 0) return null;
            
            const percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
            const isPositive = percentChange > 0;
            const isNegative = percentChange < 0;
            
            return (
              <div className="flex items-center">
                <span className="mr-1">Total trend:</span>
                <span className={`inline-flex items-center font-medium ${
                  isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isPositive ? '↑' : isNegative ? '↓' : '→'}
                  {Math.abs(percentChange).toFixed(1)}%
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CostTrendChart;