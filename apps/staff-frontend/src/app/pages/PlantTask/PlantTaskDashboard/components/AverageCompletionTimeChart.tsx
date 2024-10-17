import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card } from 'antd';
import { AverageCompletionTimeData } from '@lepark/data-access';

const AverageCompletionTimeChart = ({ data }: { data: AverageCompletionTimeData[] }) => {
  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      label: 'Average Completion Time (days)',
      data: data.map(item => item.averageCompletionTime.toFixed(2)),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
    }]
  };

  const options = {
    indexAxis: 'y' as const, // to fix options type error
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Completion Time (days)'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Average Task Completion Time by Staff'
      }
    }
  };

  return (
    <Card title="Average Task Completion Time">
      <Bar data={chartData} options={options} />
    </Card>
  );
};

export default AverageCompletionTimeChart;