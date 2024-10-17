import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker, Tooltip } from 'antd';
import { AverageCompletionTimeData, getParkAverageTaskCompletionTime, StaffResponse } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons'; // Optional, using an icon

const { RangePicker } = DatePicker;

const AverageCompletionTimeChart = () => {
  const [data, setData] = useState<AverageCompletionTimeData[]>([]);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(1, 'month').toISOString());
  const [endDate, setEndDate] = useState<string>(dayjs().toISOString());
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const response = await getParkAverageTaskCompletionTime(user?.parkId ?? null, new Date(startDate), new Date(endDate));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching average completion time data:', error);
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

  const chartData = {
    labels: data.map(item => item.staff.firstName + ' ' + item.staff.lastName),
    datasets: [{
      label: 'Average Completion Time (days)',
      data: data.map(item => item.averageCompletionTime.toFixed(2)),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
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
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Card 
      
      title={
        <div>
          Average Task Completion Time
          <Tooltip title="This chart shows the average completion time of tasks among different staff members for the selected period.">
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '8px' }} />
          </Tooltip>
        </div>
      }
      extra={
        <RangePicker 
          onChange={handleDateChange}
          defaultValue={[dayjs().subtract(1, 'month'), dayjs()]}
        />
      }
    >
      <div style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default AverageCompletionTimeChart;
