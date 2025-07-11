'use client';

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
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CoastFireChartProps {
  data: Array<{
    age: number;
    year: number;
    netWorth: number;
    coastFireTarget: number;
  }>;
}

export default function CoastFireChart({ data }: CoastFireChartProps) {
  const chartData = {
    labels: data.map(item => item.age),
    datasets: [
      {
        label: 'Projected Net Worth',
        data: data.map(item => item.netWorth),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Coast FIRE Target',
        data: data.map(item => item.coastFireTarget),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.1,
        borderDash: [5, 5],
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Coast FIRE Projection',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)',
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow-lg p-6">
      <Line data={chartData} options={options} />
    </div>
  );
}