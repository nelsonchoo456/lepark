import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card } from 'antd';
import { OverdueRateData } from '@lepark/data-access';

const OverdueRateChart = ({ data }: { data: OverdueRateData[] }) => {
  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      label: 'Overdue Rate (%)',
      data: data.map(item => item.overdueRate),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Plant Task Overdue Rates by Staff'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Overdue Rate: ${context.raw.toFixed(2)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Overdue Rate (%)'
        },
        ticks: {
          callback: (value: any) => `${value}%`
        }
      }
    }
  };

  return (
    <Card title="Task Overdue Rates">
      <Bar data={chartData} options={options} />
    </Card>
  );
};

export default OverdueRateChart;
