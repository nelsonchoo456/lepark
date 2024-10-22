import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ParkAssetResponse } from '@lepark/data-access';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { Button } from 'antd';

const MaintenanceGraphTabParkAsset = ({ parkAsset }: { parkAsset: ParkAssetResponse }) => {
  const navigate = useNavigate();

  // Prepare data for the bar chart
  const nextMaintenanceDates = parkAsset.nextMaintenanceDates || [];
  const intervals = nextMaintenanceDates.map((date, index) => {
    if (index === 0) return dayjs(date).diff(dayjs(), 'day'); // Interval from the current date
    return dayjs(date).diff(dayjs(nextMaintenanceDates[index - 1]), 'day');
  });

  const barChartData = {
    labels: nextMaintenanceDates.map((date) => dayjs(date).format('MMMM D, YYYY')),
    datasets: [
      {
        label: 'Maintenance Interval (days)',
        data: intervals,
        backgroundColor: '#3498db',
        borderColor: '#3498db',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Next Maintenance Dates',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Interval (days)',
        },
      },
    },
  };

  const handleCreateTask = () => {
    const earliestDate = nextMaintenanceDates.length > 0 ? dayjs(nextMaintenanceDates[0]).format('YYYY-MM-DD') : '';
    navigate(`/maintenance-tasks/create?entityId=${parkAsset.identifierNumber}&dueDate=${earliestDate}&entityType=parkAsset`);
  };

  return (
    <div>
      {nextMaintenanceDates.length > 0 && <Bar data={barChartData} options={barChartOptions} />}
      <Button type="primary" onClick={handleCreateTask} style={{ marginTop: '20px' }}>
        Create Maintenance Task
      </Button>
    </div>
  );
};

export default MaintenanceGraphTabParkAsset;