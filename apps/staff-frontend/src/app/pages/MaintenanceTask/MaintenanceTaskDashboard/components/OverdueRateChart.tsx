import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker, Tooltip } from 'antd';
import { OverdueRateMaintenanceTaskData, StaffResponse, getParkMaintenanceTaskOverdueRateForPeriod } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons'; // Optional, using an icon

const { RangePicker } = DatePicker;

const OverdueRateChart = () => {
  const [data, setData] = useState<OverdueRateMaintenanceTaskData[]>([]);
  const [startDate, setStartDate] = useState<string>(dayjs().startOf('month').toISOString());
  const [endDate, setEndDate] = useState<string>(dayjs().endOf('month').toISOString());
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const response = await getParkMaintenanceTaskOverdueRateForPeriod(user?.parkId ?? null, new Date(startDate), new Date(endDate));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching overdue rate data:', error);
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dayjs(dateStrings[0]).toISOString());
    setEndDate(dayjs(dateStrings[1]).toISOString());
  };

  const chartData = {
    labels: data.map((item) => item.taskType),
    datasets: [
      {
        label: 'Overdue Rate (%)',
        data: data.map((item) => item.overdueRate),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Overdue Rate (%)',
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Maintenance Task Overdue Rates',
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Card
      title={
        <div>
          Task Overdue Rates
          <Tooltip title="This chart shows the overdue rates of tasks among different task types for the selected period.">
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '8px' }} />
          </Tooltip>
        </div>
      }
      extra={<RangePicker onChange={handleDateChange} defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]} />}
      styles={{ body: { height: '450px', minHeight: '400px' } }}
    >
      <Bar data={chartData} options={options} />
    </Card>
  );
};

export default OverdueRateChart;
