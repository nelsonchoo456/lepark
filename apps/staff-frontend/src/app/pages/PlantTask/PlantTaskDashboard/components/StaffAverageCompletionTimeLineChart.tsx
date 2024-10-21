import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Select, Tooltip } from 'antd';
import { getParkStaffAverageCompletionTimeForPastMonths, ParkStaffAverageCompletionTimeForPastMonthsData, StaffResponse } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

// Add this constant for the fixed colors
const CHART_COLORS = [
  '#FF6384', // Bright Pink
  '#36A2EB', // Bright Blue
  '#FFCE56', // Bright Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#FF6384', // Green
  '#C9CBCF'  // Gray
];

const StaffAverageCompletionTimeLineChart: React.FC = () => {
  const [data, setData] = useState<ParkStaffAverageCompletionTimeForPastMonthsData[]>([]);
  const [months, setMonths] = useState<number>(3);
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    fetchData();
  }, [months]);

  const fetchData = async () => {
    try {
      const response = await getParkStaffAverageCompletionTimeForPastMonths(user?.parkId ?? null, months);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching average completion time data:', error);
    }
  };

  const handleMonthChange = (value: number) => {
    setMonths(value);
  };

  const chartData = {
    labels: Array.from({ length: months }, (_, i) => {
      const date = moment().startOf('month').subtract(i, 'months');
      return date.format('MMMM YYYY');
    }).reverse(),
    datasets: data.map((item, index) => ({
      label: `${item.staff.firstName} ${item.staff.lastName}`,
      data: item.averageCompletionTimes.reverse().map(time => time.toFixed(2)),
      fill: false,
      borderColor: CHART_COLORS[index % CHART_COLORS.length], // Use fixed colors
      tension: 0.1
    }))
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Completion Time (days)'
        },
      }
    },
    plugins: {
      title: {
        display: true,
        text: `Staff Average Task Completion Time (Last ${months} Full Months)`
      },
      legend: {
        position: 'bottom' as const,
      }
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Card 
      title={
        <div>
          Staff Average Completion Time Trend
          <Tooltip title="This chart shows the trend of average task completion time for each staff member over the selected number of past months.">
            <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', marginLeft: '8px' }} />
          </Tooltip>
        </div>
      }
      extra={
        <Select 
          defaultValue={3} 
          style={{ width: 120 }} 
          onChange={handleMonthChange}
        >
          <Option value={3}>3 Months</Option>
          <Option value={6}>6 Months</Option>
          <Option value={9}>9 Months</Option>
          <Option value={12}>12 Months</Option>
        </Select>
      }
    >
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default StaffAverageCompletionTimeLineChart;
