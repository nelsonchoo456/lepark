import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card } from 'antd';
import { CompletionRateData } from '@lepark/data-access';

const CompletionRateChart = ({ data }: { data: CompletionRateData[] }) => {
  console.log(data);
  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      label: 'Completion Rate',
      data: data.map(item => item.completionRate),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion Rate (%)'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Plant Task Completion Rates by Staff'
      }
    }
  };

  return (
    <Card title="Task Completion Rates">
      <Bar data={chartData} options={options} />
    </Card>
  );
};

export default CompletionRateChart;