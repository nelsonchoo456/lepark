import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card } from 'antd';
import { TaskLoadPercentageData } from '@lepark/data-access';

const TaskLoadPercentageChart = ({ data }: { data: TaskLoadPercentageData[] }) => {
  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      data: data.map(item => item.taskLoadPercentage),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
    }]
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Task Load Distribution Among Staff'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw.toFixed(2)}%`
        }
      }
    }
  };

  return (
    <Card title="Task Load Distribution">
      <Doughnut data={chartData} options={options} />
    </Card>
  );
};

export default TaskLoadPercentageChart;