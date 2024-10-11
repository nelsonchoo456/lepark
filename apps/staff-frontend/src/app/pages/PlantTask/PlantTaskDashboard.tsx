import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlantTaskResponse } from '@lepark/data-access';
import moment from 'moment';

interface PlantTaskDashboardProps {
  plantTasks: PlantTaskResponse[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PlantTaskDashboard: React.FC<PlantTaskDashboardProps> = ({ plantTasks }) => {
  const getStatusData = () => {
    const statusCounts = plantTasks.reduce((acc, task) => {
      acc[task.taskStatus] = (acc[task.taskStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const getProgressData = () => {
    const cancelled = plantTasks.filter((task) => task.taskStatus === 'CANCELLED').length;
    const completed = plantTasks.filter((task) => task.taskStatus === 'COMPLETED').length;
    const inProgress = plantTasks.filter((task) => task.taskStatus === 'IN_PROGRESS').length;
    const open = plantTasks.filter((task) => task.taskStatus === 'OPEN').length;
    return [
      { name: 'Cancelled', value: cancelled },
      { name: 'Completed', value: completed },
      { name: 'In Progress', value: inProgress },
      { name: 'Open', value: open },
    ];
  };

  const getUrgencyData = () => {
    const urgencyCounts = plantTasks.reduce((acc, task) => {
      acc[task.taskUrgency] = (acc[task.taskUrgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(urgencyCounts).map(([name, value]) => ({ name, value }));
  };

  const totalOpenTasks = plantTasks.filter((task) => task.taskStatus === 'OPEN').length;
  const urgentTasks = plantTasks.filter(
    (task) =>
      (task.taskUrgency === 'HIGH' || task.taskUrgency === 'IMMEDIATE') &&
      task.taskStatus !== 'COMPLETED' &&
      task.taskStatus !== 'CANCELLED',
  ).length;
  const overdueTasks = plantTasks.filter(
    (task) => moment(task.dueDate).isBefore(moment()) && task.taskStatus !== 'COMPLETED' && task.taskStatus !== 'CANCELLED',
  ).length;

  return (
    <Row gutter={16}>
      <Col span={12}>
        <h3>Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={getProgressData()}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {getProgressData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );
};

export default PlantTaskDashboard;
