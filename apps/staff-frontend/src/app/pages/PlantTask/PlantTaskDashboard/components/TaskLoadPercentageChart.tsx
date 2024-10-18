import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, DatePicker, Typography, Tooltip } from 'antd';
import { StaffResponse, TaskLoadPercentageData, getParkTaskLoadPercentage } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons'; // Optional, using an icon

const { RangePicker } = DatePicker;
const { Title } = Typography;

const TaskLoadPercentageChart = () => {
  const { user } = useAuth<StaffResponse>();
  const [data, setData] = useState<TaskLoadPercentageData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getParkTaskLoadPercentage(user?.parkId ?? null);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching task load percentage data:', error);
    }
  };

  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      data: data.map(item => item.taskLoadPercentage.toFixed(2)),
      backgroundColor: [
        'rgba(255, 99, 71, 0.6)',   // Tomato
        'rgba(173, 255, 47, 0.6)',  // Green Yellow
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)',
        'rgba(144, 238, 144, 0.6)', // Light Green
        'rgba(135, 206, 250, 0.6)', // Sky Blue
        'rgba(221, 160, 221, 0.6)', // Plum
        'rgba(255, 182, 193, 0.6)', // Light Pink
        'rgba(255, 165, 0, 0.6)',   // Orange
        'rgba(240, 128, 128, 0.6)', // Light Coral
        'rgba(100, 149, 237, 0.6)', // Cornflower Blue
        'rgba(255, 140, 0, 0.6)',   // Dark Orange
        'rgba(127, 255, 212, 0.6)', // Aquamarine
        'rgba(255, 20, 147, 0.6)',  // Deep Pink
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
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const isAllZero = data.every(item => item.taskLoadPercentage === 0);

  const renderChart = () => {
    if (isAllZero) {
      return (
        <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Title level={4}>All Staff are free from any task right now! </Title>
          <img src="https://cdn.iconscout.com/icon/free/png-512/free-cute-happy-flower-character-sticker-icon-download-in-svg-png-gif-file-formats--floral-blossom-pack-nature-icons-7822140.png?f=webp&w=256" alt="Smiley Plant" style={{ width: '48px', height: '48px', marginRight: '10px' }} />
        </div>
      );
    }

    return <Doughnut data={chartData} options={options} />;
  };

  return (
    <Card 
      title={
        <div>
          Task Load Distribution
          <Tooltip title="This chart shows the distribution of task loads among different staff members currently.">
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '8px' }} />
          </Tooltip>
        </div>
      }
    >
      <div style={{ height: '400px' }}>
        {renderChart()}
      </div>
    </Card>
  );
};

export default TaskLoadPercentageChart;
