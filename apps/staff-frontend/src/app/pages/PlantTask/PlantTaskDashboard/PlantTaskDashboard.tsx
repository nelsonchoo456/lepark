import React, { useMemo } from 'react';
import { Row, Col, Card, Select, Typography } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { PlantTaskResponse, PlantTaskStatusEnum, PlantTaskUrgencyEnum, PlantTaskTypeEnum } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { COLORS } from '../../../config/colors';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

interface PlantTaskDashboardProps {
  plantTasks: PlantTaskResponse[];
  isSuperAdmin: boolean;
  selectedParkId: string | null;
  onParkChange: (parkId: string | null) => void;
  parkOptions: { value: string | null; label: string }[];
}

export const STATUS_COLORS = {
  [PlantTaskStatusEnum.OPEN]: COLORS.sky[400],
  [PlantTaskStatusEnum.IN_PROGRESS]: COLORS.mustard[400],
  [PlantTaskStatusEnum.COMPLETED]: COLORS.green[400],
  [PlantTaskStatusEnum.CANCELLED]: COLORS.gray[400],
};

const URGENCY_COLORS = {
  [PlantTaskUrgencyEnum.IMMEDIATE]: '#f5222d',
  [PlantTaskUrgencyEnum.HIGH]: '#fa8c16',
  [PlantTaskUrgencyEnum.NORMAL]: '#1890ff',
  [PlantTaskUrgencyEnum.LOW]: '#52c41a',
};

const TASK_TYPE_COLORS = {
  [PlantTaskTypeEnum.INSPECTION]: '#8884d8',            // Soft Purple
  [PlantTaskTypeEnum.WATERING]: '#82ca9d',              // Soft Green
  [PlantTaskTypeEnum.PRUNING_TRIMMING]: '#ffc658',      // Soft Yellow
  [PlantTaskTypeEnum.PEST_MANAGEMENT]: '#ff7f50',       // Coral (distinct from green)
  [PlantTaskTypeEnum.SOIL_MAINTENANCE]: '#d0ed57',      // Light Lime
  [PlantTaskTypeEnum.STAKING_SUPPORTING]: '#fc907a',    // Light Salmon
  [PlantTaskTypeEnum.DEBRIS_REMOVAL]: '#20b2aa',        // Light Sea Green
  [PlantTaskTypeEnum.ENVIRONMENTAL_ADJUSTMENT]: '#f92c85', // Bright Pink
  [PlantTaskTypeEnum.OTHERS]: '#20aaff',                // Sky Blue
};

const URGENCY_ORDER = [
  PlantTaskUrgencyEnum.LOW,
  PlantTaskUrgencyEnum.NORMAL,
  PlantTaskUrgencyEnum.HIGH,
  PlantTaskUrgencyEnum.IMMEDIATE,
];

const { Title } = Typography;

const PlantTaskDashboard: React.FC<PlantTaskDashboardProps> = ({
  plantTasks,
  isSuperAdmin,
  selectedParkId,
  onParkChange,
  parkOptions,
}) => {
  const filteredPlantTasks = useMemo(() => {
    if (!selectedParkId) return plantTasks;
    return plantTasks.filter(task => task.occurrence?.zone?.park?.name === selectedParkId);
  }, [plantTasks, selectedParkId]);

  const pendingTasks = useMemo(() => {
    return filteredPlantTasks.filter(task => 
      task.taskStatus === PlantTaskStatusEnum.OPEN || 
      task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS
    );
  }, [filteredPlantTasks]);

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
    const statusCounts = filteredPlantTasks
      .filter(task => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
      .reduce((acc, task) => {
        acc[task.taskStatus] = (acc[task.taskStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, value]) => ({
      name: formatEnumLabelToRemoveUnderscores(status),
      value,
      color: STATUS_COLORS[status as PlantTaskStatusEnum],
    }));
  };

  const getUrgencyData = () => {
    const urgencyCounts = filteredPlantTasks
      .filter(task => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
      .reduce((acc, task) => {
        acc[task.taskUrgency] = (acc[task.taskUrgency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return URGENCY_ORDER.map(urgency => ({
      name: formatEnumLabelToRemoveUnderscores(urgency),
      value: urgencyCounts[urgency] || 0,
      color: URGENCY_COLORS[urgency as PlantTaskUrgencyEnum],
    }));
  };

  const getTaskTypeData = () => {
    const typeCounts = filteredPlantTasks.filter(task => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS).reduce((acc, task) => {
      acc[task.taskType] = (acc[task.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, value]) => ({
      name: formatEnumLabelToRemoveUnderscores(type),
      value,
      color: TASK_TYPE_COLORS[type as PlantTaskTypeEnum],
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
        src="https://cdn.iconscout.com/icon/free/png-512/free-cute-happy-flower-character-sticker-icon-download-in-svg-png-gif-file-formats--floral-blossom-pack-nature-icons-7822140.png?f=webp&w=256" 
        alt="Smiley Plant" 
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

export default PlantTaskDashboard;
