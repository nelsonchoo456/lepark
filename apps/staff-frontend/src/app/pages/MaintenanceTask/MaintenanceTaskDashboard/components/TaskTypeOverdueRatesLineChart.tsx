import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Select, Tooltip } from 'antd';
import { getParkTaskTypeOverdueRatesForPastMonths, ParkTaskTypeOverdueRatesForPastMonthsData, StaffResponse } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const CHART_COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF'
];

const TaskTypeOverdueRatesLineChart: React.FC = () => {
  const [data, setData] = useState<ParkTaskTypeOverdueRatesForPastMonthsData[]>([]);
  const [months, setMonths] = useState<number>(3);
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    fetchData();
  }, [months]);

  const fetchData = async () => {
    try {
      const response = await getParkTaskTypeOverdueRatesForPastMonths(user?.parkId ?? null, months);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching overdue rates data:', error);
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
      label: item.taskType,
      data: item.overdueRates.map(rate => (rate * 100).toFixed(2)), // Convert to percentage
      fill: false,
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      tension: 0.1
    }))
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Overdue Rate (%)'
        },
      }
    },
    plugins: {
      title: {
        display: true,
        text: `Task Type Overdue Rates (Last ${months} Full Months)`
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
          Task Type Overdue Rates Trend
          <Tooltip title="This chart shows the trend of overdue rates for each task type over the selected number of past months.">
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

export default TaskTypeOverdueRatesLineChart;