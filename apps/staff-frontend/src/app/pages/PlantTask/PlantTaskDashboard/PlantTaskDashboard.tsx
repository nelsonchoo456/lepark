import React from 'react';
import { Row, Col } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlantTaskResponse, PlantTaskStatusEnum, PlantTaskUrgencyEnum, PlantTaskTypeEnum } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

interface PlantTaskDashboardProps {
  plantTasks: PlantTaskResponse[];
}

const STATUS_COLORS = {
  [PlantTaskStatusEnum.OPEN]: '#d9d9d9',
  [PlantTaskStatusEnum.IN_PROGRESS]: '#1890ff',
  [PlantTaskStatusEnum.COMPLETED]: '#52c41a',
  [PlantTaskStatusEnum.CANCELLED]: '#8c8c8c',
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

const PlantTaskDashboard: React.FC<PlantTaskDashboardProps> = ({ plantTasks }) => {
  const getStatusData = () => {
    const statusCounts = plantTasks.reduce((acc, task) => {
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
    const urgencyCounts = plantTasks.reduce((acc, task) => {
      acc[task.taskUrgency] = (acc[task.taskUrgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(urgencyCounts).map(([urgency, value]) => ({
      name: formatEnumLabelToRemoveUnderscores(urgency),
      value,
      color: URGENCY_COLORS[urgency as PlantTaskUrgencyEnum],
    }));
  };

  const getTaskTypeData = () => {
    const typeCounts = plantTasks.reduce((acc, task) => {
      acc[task.taskType] = (acc[task.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, value]) => ({
      name: formatEnumLabelToRemoveUnderscores(type),
      value,
      color: TASK_TYPE_COLORS[type as PlantTaskTypeEnum],
    }));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number, index: number, name: string }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2; // Increase this value to add more gap
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#888" fill="none" />
        <circle cx={ex} cy={ey} r={2} fill="#888" stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          dominantBaseline="central"
        >
          {`${name} (${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <h3>Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={getStatusData()}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {getStatusData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Col>
      <Col span={12}>
        <h3>Tasks by Urgency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getUrgencyData()}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {getUrgencyData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Col>
      <Col span={24}>
        <h3>Task Distribution by Type</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={getTaskTypeData()}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {getTaskTypeData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );
};

export default PlantTaskDashboard;
