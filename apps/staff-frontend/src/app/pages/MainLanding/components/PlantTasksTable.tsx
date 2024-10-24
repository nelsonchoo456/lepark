import {
  getAllAssignedPlantTasks,
  getAllPlantTasks,
  getPlantTasksByParkId,
  PlantTaskResponse,
  PlantTaskStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { Badge, Button, Card, Flex, Statistic, Table, TableProps, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { FiAlertCircle, FiClock, FiEye } from 'react-icons/fi';
import { COLORS } from '../../../config/colors';
import { formatTaskType } from '../../PlantTask/PlantTaskTableView';
import { SCREEN_LG } from '../../../config/breakpoints';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@lepark/common-ui';
import { flexColsStyles, sectionHeaderIconStyles } from '../Manager/ManagerMainLanding';
import { MdCheck } from 'react-icons/md';
import { Pie } from 'react-chartjs-2';
import { STATUS_COLORS } from '../../PlantTask/PlantTaskDashboard/PlantTaskDashboard';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

interface PlantTasksTableProps {
  userRole: StaffType;
  plantTasks: PlantTaskResponse[];
  [key: string]: any;
}
const PlantTasksTable = ({ userRole, plantTasks, ...tableProps }: PlantTasksTableProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const openTasks = useMemo(() => {
    return plantTasks ? plantTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN) : [];
  }, [plantTasks]);

  const inProgressTasks = useMemo(() => {
    return plantTasks ? plantTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS) : [];
  }, [plantTasks]);

  const completedTasks = useMemo(() => {
    return plantTasks ? plantTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.COMPLETED) : [];
  }, [plantTasks]);

  const pendingTasks = useMemo(() => {
    return plantTasks
      ? plantTasks
          .filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
          .reverse()
      : [];
  }, [plantTasks]);

  const overduePlantTasks = useMemo(() => {
    return plantTasks
      ? plantTasks.filter(
          (task) =>
            task.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
            task.taskStatus !== PlantTaskStatusEnum.CANCELLED &&
            moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')),
        )
      : [];
  }, [plantTasks]);

  const pendingColumns: TableProps<PlantTaskResponse>['columns'] = [
    {
      title: 'Tasks',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      // width: '20%',
    },
    {
      title: 'Task Type',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (text) => (
        <Flex justify="space-between" align="center">
          {formatTaskType(text)}
        </Flex>
      ),
      // width: '15%',
    },
    {
      title: 'Urgency',
      dataIndex: 'taskUrgency',
      key: 'taskUrgency',
      render: (text) => {
        switch (text) {
          case 'IMMEDIATE':
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'HIGH':
            return (
              <Tag color="orange" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'NORMAL':
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'LOW':
            return (
              <Tag color="green" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          default:
            return <Tag>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
        }
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (text, record) => {
        const isOverdue =
          moment().startOf('day').isAfter(moment(text).startOf('day')) &&
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        const isDueSoon =
          moment(text).startOf('day').isSameOrBefore(moment().startOf('day').add(3, 'days')) &&
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        return (
          <Flex align="center">
            {moment(text).format('D MMM YY')}
            {isOverdue && <FiAlertCircle className="ml-2 text-red-500" />}
            {isDueSoon && !isOverdue && <FiClock className="ml-2 text-yellow-500" />}
          </Flex>
        );
      },
    },
    {
      title: 'Assigned Staff',
      key: 'assignedStaff',
      render: (_, record) => {
        if (record.assignedStaff) {
          return <span>{`${record.assignedStaff.firstName} ${record.assignedStaff.lastName}`}</span>;
        } else {
          return <span className="text-secondary">Unassigned</span>;
        }
      },
      width: '15%',
    },
  ];

  const columns: TableProps<PlantTaskResponse>['columns'] = [
    {
      title: 'Tasks',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      // width: '20%',
    },
    {
      title: userRole === StaffType.SUPERADMIN ? 'Park, Zone' : 'Zone',
      render: (_, record) => (
        <div>
          {userRole === StaffType.SUPERADMIN && <p className="font-semibold">{record.occurrence?.zone?.park?.name}</p>}
          <div className="flex">
            {userRole !== StaffType.SUPERADMIN && <p className="opacity-50 mr-2"></p>}
            {record.occurrence?.zone?.name}
          </div>
        </div>
      ),
      // width: '15%',
    },
    {
      title: 'Task Type',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (text) => (
        <Flex justify="space-between" align="center">
          {formatTaskType(text)}
        </Flex>
      ),
      // width: '15%',
    },
    {
      title: 'Urgency',
      dataIndex: 'taskUrgency',
      key: 'taskUrgency',
      render: (text) => {
        switch (text) {
          case 'IMMEDIATE':
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'HIGH':
            return (
              <Tag color="orange" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'NORMAL':
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'LOW':
            return (
              <Tag color="green" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          default:
            return <Tag>{formatEnumLabelToRemoveUnderscores(text)}</Tag>;
        }
      },
      width: '1%',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('D MMM YY'),
      width: '10%',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (text, record) => {
        const isOverdue =
          moment().startOf('day').isAfter(moment(text).startOf('day')) &&
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        const isDueSoon =
          moment(text).startOf('day').isSameOrBefore(moment().startOf('day').add(3, 'days')) &&
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        return (
          <Flex align="center">
            {moment(text).format('D MMM YY')}
            {isOverdue && <FiAlertCircle className="ml-2 text-red-500" />}
            {isDueSoon && !isOverdue && <FiClock className="ml-2 text-yellow-500" />}
          </Flex>
        );
      },
      width: '10%',
    },
    {
      title: 'Status',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color={COLORS.sky[400]} bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'IN_PROGRESS':
            return (
              <Tag color={COLORS.mustard[400]} bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'COMPLETED':
            return (
              <Tag color={COLORS.green[400]} bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'CANCELLED':
            return (
              <Tag color="gray" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          default:
            return <Tag>{text}</Tag>;
        }
      },
      width: '1%',
    },
    {
      title: 'Assigned Staff',
      key: 'assignedStaff',
      render: (_, record) => {
        if (record.assignedStaff) {
          return <span>{`${record.assignedStaff.firstName} ${record.assignedStaff.lastName}`}</span>;
        } else {
          return <span className="text-secondary">Unassigned</span>;
        }
      },
      width: '15%',
    },
  ];

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

  const getChartData = (dataFunction: () => { name: string; value: number; color: string }[]) => {
    const data = dataFunction();
    return {
      labels: data.map((item) => item.name),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => item.color),
          borderColor: data.map((item) => item.color),
          borderWidth: 1,
        },
      ],
    };
  };

  const getStatusData = () => {
    const statusCounts = plantTasks
      ?.filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
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

  return (
    <>
      <div className={`${flexColsStyles} mb-4 overflow-x-scroll`}>
        {pendingTasks && pendingTasks?.length > 0 ? (
          <>
            <div className="w-full flex-[2] flex flex-col w-full">
              <div className="flex items-center font-semibold text-mustard-500">
                <div className={`bg-mustard-400 text-white h-6 w-6 flex justify-center items-center rounded-full mr-2`}>
                  {pendingTasks.length}
                </div>
                Pending Tasks
              </div>
              <Table
                dataSource={pendingTasks.slice(0, 3)}
                columns={pendingColumns}
                rowKey="id"
                size="small"
                pagination={false}
                {...tableProps}
              />
              {pendingTasks?.length > 3 && (
                <Button type="dashed" className="-mt-[1px] rounded-0 text-secondary" onClick={() => navigate('plant-tasks')}>
                  Go to Pending Tasks to view more
                </Button>
              )}
            </div>
            <Card className="w-full flex-[1] flex flex-col justify-center hidden md:hidden lg:block" styles={{ body: { padding: "0 1rem"}}}>
              <div className="font-semibold text-mustard-500 mb-4">Pending Tasks Breakdown:</div>
              <div className="h-36 md:w-full flex justify-center">
                <Pie data={getChartData(getStatusData)} options={chartOptions} />
              </div>
            </Card>
          </>
        ) : (
          <div className="flex items-center font-semibold text-mustard-500">
            <div className={`${sectionHeaderIconStyles} bg-mustard-400 text-white h-6 w-6`}>
              <MdCheck />
            </div>
            No Pending Tasks
          </div>
        )}
      </div>
      <div className={flexColsStyles}>
        {overduePlantTasks && overduePlantTasks?.length > 0 ? (
          <div className="flex flex-col w-full">
            <div className="flex items-center font-semibold text-error">
              <div className={`bg-red-400 text-white h-6 w-6 flex justify-center items-center rounded-full mr-2`}>
                {overduePlantTasks.length}
              </div>
              Overdue Tasks
            </div>
            <Table
              dataSource={overduePlantTasks.slice(0, 3)}
              columns={columns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: SCREEN_LG }}
              {...tableProps}
            />
            {overduePlantTasks?.length > 3 && (
              <Button type="dashed" className="-mt-[1px] rounded-0 text-secondary" onClick={() => navigate('plant-tasks')}>
                Go to Pending Tasks to view more
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center font-semibold text-green-300">
            <div className={`${sectionHeaderIconStyles} bg-green-300 text-white h-6 w-6`}>
              <MdCheck />
            </div>
            No Overdue Tasks
          </div>
        )}
      </div>
    </>
  );
};

export default PlantTasksTable;
