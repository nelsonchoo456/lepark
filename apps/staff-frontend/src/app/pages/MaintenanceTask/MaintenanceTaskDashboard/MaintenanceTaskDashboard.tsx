import React, { useMemo } from 'react';
import { Row, Col, Card, Select, Typography } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { MaintenanceTaskResponse, MaintenanceTaskStatusEnum, MaintenanceTaskUrgencyEnum, MaintenanceTaskTypeEnum } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { COLORS } from '../../../config/colors';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

interface MaintenanceTaskDashboardProps {
  maintenanceTasks: MaintenanceTaskResponse[];
  isSuperAdmin: boolean;
  selectedParkId: string | null;
  onParkChange: (parkId: string | null) => void;
  parkOptions: { value: string | null; label: string }[];
}

export const STATUS_COLORS = {
  [MaintenanceTaskStatusEnum.OPEN]: COLORS.sky[400],
  [MaintenanceTaskStatusEnum.IN_PROGRESS]: COLORS.mustard[400],
  [MaintenanceTaskStatusEnum.COMPLETED]: COLORS.green[400],
  [MaintenanceTaskStatusEnum.CANCELLED]: COLORS.gray[400],
};

const URGENCY_COLORS = {
  [MaintenanceTaskUrgencyEnum.IMMEDIATE]: '#f5222d',
  [MaintenanceTaskUrgencyEnum.HIGH]: '#fa8c16',
  [MaintenanceTaskUrgencyEnum.NORMAL]: '#1890ff',
  [MaintenanceTaskUrgencyEnum.LOW]: '#52c41a',
};

const TASK_TYPE_COLORS = {
  [MaintenanceTaskTypeEnum.INSPECTION]: '#8884d8',            // Soft Purple
  [MaintenanceTaskTypeEnum.CLEANING]: '#82ca9d',              // Soft Green
  [MaintenanceTaskTypeEnum.REPAIR]: '#ffc658',                // Soft Yellow
  [MaintenanceTaskTypeEnum.PLUMBING]: '#ff7f50',              // Coral
  [MaintenanceTaskTypeEnum.ELECTRICAL]: '#d0ed57',            // Light Lime
  [MaintenanceTaskTypeEnum.HEAT_AND_AIR_CONDITIONING]: '#fc907a', // Light Salmon
  [MaintenanceTaskTypeEnum.CALIBRATION]: '#20b2aa',           // Light Sea Green
  [MaintenanceTaskTypeEnum.SOFTWARE_UPDATE]: '#f92c85',       // Bright Pink
  [MaintenanceTaskTypeEnum.HARDWARE_REPLACEMENT]: '#20aaff',  // Sky Blue
  [MaintenanceTaskTypeEnum.TESTING]: '#ff6b6b',               // Soft Red
  [MaintenanceTaskTypeEnum.ASSET_RELOCATION]: '#4ecdc4',      // Medium Turquoise
  [MaintenanceTaskTypeEnum.FIRE_SAFETY]: '#ff9ff3',           // Soft Pink
  [MaintenanceTaskTypeEnum.SECURITY_CHECK]: '#54a0ff',        // Bright Blue
  [MaintenanceTaskTypeEnum.WASTE_MANAGEMENT]: '#5f27cd',      // Deep Purple
  [MaintenanceTaskTypeEnum.OTHERS]: '#ff9ff3',                // Soft Pink
};

const URGENCY_ORDER = [
  MaintenanceTaskUrgencyEnum.LOW,
  MaintenanceTaskUrgencyEnum.NORMAL,
  MaintenanceTaskUrgencyEnum.HIGH,
  MaintenanceTaskUrgencyEnum.IMMEDIATE,
];

const { Title } = Typography;

const MaintenanceTaskDashboard: React.FC<MaintenanceTaskDashboardProps> = ({
  maintenanceTasks,
  isSuperAdmin,
  selectedParkId,
  onParkChange,
  parkOptions,
}) => {
  const filteredMaintenanceTasks = useMemo(() => {
    if (!selectedParkId) return maintenanceTasks;
    return maintenanceTasks.filter(task => task.facilityOfFaultyEntity.parkId === Number(selectedParkId));
  }, [maintenanceTasks, selectedParkId]);

  const pendingTasks = useMemo(() => {
    return filteredMaintenanceTasks.filter(task => 
      task.taskStatus === MaintenanceTaskStatusEnum.OPEN || 
      task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS
    );
  }, [filteredMaintenanceTasks]);

  const getChartData = (dataFunction: () => { name: string; value: number; color: string }[]) => {
    const data = dataFunction();
    return {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
      }],
    };
  };

  const getStatusData = () => {
    const statusCounts = filteredMaintenanceTasks
      .filter(task => task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS)
      .reduce((acc, task) => {
        acc[task.taskStatus] = (acc[task.taskStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, value]) => ({
      name: formatEnumLabelToRemoveUnderscores(status),
      value,
      color: STATUS_COLORS[status as MaintenanceTaskStatusEnum],
    }));
  };

  const getUrgencyData = () => {
    const urgencyCounts = filteredMaintenanceTasks
      .filter(task => task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS)
      .reduce((acc, task) => {
        acc[task.taskUrgency] = (acc[task.taskUrgency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return URGENCY_ORDER.map(urgency => ({
      name: formatEnumLabelToRemoveUnderscores(urgency),
      value: urgencyCounts[urgency] || 0,
      color: URGENCY_COLORS[urgency as MaintenanceTaskUrgencyEnum],
    }));
  };

  const getTaskTypeData = () => {
    const typeCounts = filteredMaintenanceTasks.filter(task => task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS).reduce((acc, task) => {
      acc[task.taskType] = (acc[task.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, value]) => ({
      name: formatEnumLabelToRemoveUnderscores(type),
      value,
      color: TASK_TYPE_COLORS[type as MaintenanceTaskTypeEnum],
    }));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed.y || context.parsed || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc: number, current: number) => acc + current, 0);
            const percentage = ((value / total) * 100).toFixed(0);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: '#000',
        font: {
          size: 12,
        },
        formatter: (value: number, context: any) => {
          const dataset = context.dataset;
          const total = dataset.data.reduce((acc: number, current: number) => acc + current, 0);
          const percentage = ((value / total) * 100).toFixed(0);
          return `${value}\n(${percentage}%)`;
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderNoTasksMessage = () => (
    <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Title level={4}>All tasks are completed! No pending tasks right now. </Title>
      <img 
        src="https://media.istockphoto.com/id/1012071530/vector/wrench-icon-with-smiley-stickman-vector.jpg?s=170667a&w=0&k=20&c=_T27NJCrTHO6m3HhdHVbokR9m3w0FtDbYgDIYEl_OEo=" 
        alt="Smiley Maintenance" 
        style={{ width: '48px', height: '48px', marginLeft: '10px' }} 
      />
    </div>
  );

  return (
    <>
      {isSuperAdmin && (
        <Select
          style={{ width: 200, marginBottom: 16 }}
          placeholder="Select a park"
          onChange={onParkChange}
          value={selectedParkId}
          options={parkOptions}
        />
      )}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Pending Tasks by Status">
            <div style={{ height: '300px' }}>
              {pendingTasks.length > 0 ? (
                <Pie data={getChartData(getStatusData)} options={chartOptions} />
              ) : renderNoTasksMessage()}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Pending Tasks by Urgency">
            <div style={{ height: '300px' }}>
              {pendingTasks.length > 0 ? (
                <Bar data={getChartData(getUrgencyData)} options={barOptions} />
              ) : renderNoTasksMessage()}
            </div>
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Pending Tasks by Type">
            <div style={{ height: '400px' }}>
              {pendingTasks.length > 0 ? (
                <Pie data={getChartData(getTaskTypeData)} options={chartOptions} />
              ) : renderNoTasksMessage()}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default MaintenanceTaskDashboard;
