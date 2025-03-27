// src/components/SavingsVisualization.js
import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SavingsVisualization = ({ recommendations }) => {
  const [barChartData, setBarChartData] = useState(null);
  const [doughnutChartData, setDoughnutChartData] = useState(null);

  useEffect(() => {
    if (recommendations) {
      prepareChartData();
    }
  }, [recommendations]);

  const prepareChartData = () => {
    if (!recommendations) return;

    // Calculate savings by category
    const idleSavings = recommendations.idle_resources.reduce(
      (total, item) => total + item.estimated_savings, 0
    );
    
    const rightsizingSavings = recommendations.rightsizing_recommendations.reduce(
      (total, item) => total + item.estimated_savings, 0
    );
    
    const riSavings = recommendations.reserved_instance_recommendations.reduce(
      (total, item) => total + item.estimated_savings_1yr, 0
    );

    // Bar chart
    setBarChartData({
      labels: ['Idle Resources', 'Rightsizing', 'Reserved Instances'],
      datasets: [
        {
          label: 'Estimated Annual Savings ($)',
          data: [idleSavings, rightsizingSavings, riSavings],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });

    // Doughnut chart for recommended actions
    const idleCount = recommendations.idle_resources.length;
    const rightsizingCount = recommendations.rightsizing_recommendations.length;
    const riCount = recommendations.reserved_instance_recommendations.length;

    setDoughnutChartData({
      labels: ['Idle Resources', 'Rightsizing', 'Reserved Instances'],
      datasets: [
        {
          label: 'Number of Recommendations',
          data: [idleCount, rightsizingCount, riCount],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Estimated Annual Savings by Category',
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
                currency: 'USD',
                minimumFractionDigits: 2
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Recommendation Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (!barChartData || !doughnutChartData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar data={barChartData} options={barOptions} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <Doughnut data={doughnutChartData} options={doughnutOptions} />
      </div>
    </div>
  );
};

export default SavingsVisualization;