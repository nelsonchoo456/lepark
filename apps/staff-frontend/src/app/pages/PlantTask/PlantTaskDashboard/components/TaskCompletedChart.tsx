import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker, Tooltip } from 'antd';
import { ParkTaskCompletedData, StaffResponse, getParkTaskCompleted } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const TaskCompletedChart = () => {
  const [data, setData] = useState<ParkTaskCompletedData[]>([]);
  const [startDate, setStartDate] = useState<string>(dayjs().startOf('month').toISOString());
  const [endDate, setEndDate] = useState<string>(dayjs().endOf('month').toISOString());
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const response = await getParkTaskCompleted(user?.parkId ?? null, new Date(startDate), new Date(endDate));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching task completed data:', error);
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      label: 'Tasks Completed',
      data: data.map(item => item.taskCompleted),
      backgroundColor: 'rgba(255, 192, 203, 0.6)',
      borderColor: 'rgba(255, 192, 203, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tasks Completed'
        },
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Tasks Completed by Staff'
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Card 
      title={
        <div>
          Tasks Completed
          <Tooltip title="This chart shows the number of tasks completed by each staff member for the selected period.">
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '8px' }} />
          </Tooltip>
        </div>
      }
      extra={
        <RangePicker 
          onChange={handleDateChange}
          defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
        />
      }
      styles={{ body: { height: '450px', minHeight: '400px' } }}
    >
      <Bar data={chartData} options={options} />
    </Card>
  );
};

export default TaskCompletedChart;