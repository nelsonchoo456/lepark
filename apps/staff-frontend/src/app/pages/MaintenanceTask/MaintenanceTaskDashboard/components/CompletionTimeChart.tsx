import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker, Tooltip } from 'antd';
import { CompletionTimeData, getParkMaintenanceTaskAverageCompletionTimeForPeriod, StaffResponse } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons'; // Optional, using an icon

const { RangePicker } = DatePicker;

const CompletionTimeChart = () => {
  const [data, setData] = useState<CompletionTimeData[]>([]);
  const [startDate, setStartDate] = useState<string>(dayjs().startOf('month').toISOString());
  const [endDate, setEndDate] = useState<string>(dayjs().endOf('month').toISOString());
  const { user } = useAuth<StaffResponse>();


  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const response = await getParkMaintenanceTaskAverageCompletionTimeForPeriod(user?.parkId ?? null, new Date(startDate), new Date(endDate));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching completion rate data:', error);
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

  const chartData = {
    labels: data.map(item => item.taskType),
    datasets: [{
      label: 'Average Completion Time (days)',
      data: data.map(item => item.averageCompletionTime.toFixed(2)),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Average Completion Time (days)'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Average Completion Time for Maintenance Tasks'
      }
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Card 
      
      title={
        <div>
          Average Completion Time for Maintenance Tasks
          <Tooltip title="This chart shows the average completion time of tasks among different task types for the selected period.">
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

export default CompletionTimeChart;
