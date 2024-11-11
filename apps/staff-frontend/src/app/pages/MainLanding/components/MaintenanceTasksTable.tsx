import { Card, Button, Flex, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import React, { useMemo } from 'react';
import { FiAlertCircle, FiClock } from 'react-icons/fi';
import { MdCheck } from 'react-icons/md';
import moment from 'moment';
import { COLORS } from '../../../config/colors';
import { SCREEN_LG } from '../../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { MaintenanceTaskResponse, MaintenanceTaskStatusEnum, StaffResponse, StaffType } from '@lepark/data-access';
import { flexColsStyles, sectionHeaderIconStyles } from '../BotanistArborist/BAMainLanding';
import { Pie } from 'react-chartjs-2';

interface MaintenanceTasksTableProps extends TableProps<MaintenanceTaskResponse> {
  userRole: StaffType;
  maintenanceTasks: MaintenanceTaskResponse[];
}

const MaintenanceTasksTable = ({ userRole, maintenanceTasks, ...tableProps }: MaintenanceTasksTableProps) => {

  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();

  const pendingTasks = useMemo(() => {
    return maintenanceTasks?.filter(
      (task) => task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS,
    );
  }, [maintenanceTasks]);

  const overdueTasks = useMemo(() => {
    return maintenanceTasks?.filter(
      (task) =>
        task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
        task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED &&
        moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')),
    );
  }, [maintenanceTasks]);

  const getStatusData = useMemo(() => {
    const openTasks = pendingTasks?.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.OPEN).length || 0;
    const inProgressTasks = pendingTasks?.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS).length || 0;
    console.log('Open tasks:', openTasks);
    console.log('In Progress tasks:', inProgressTasks);
    return [openTasks, inProgressTasks];
  }, [pendingTasks]);

  const getChartData = (data: number[]) => ({
    labels: ['Open', 'In Progress'],
    datasets: [
      {
        data,
        backgroundColor: [COLORS.sky[400], COLORS.mustard[400]],
      },
    ],
  });

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const pendingColumns: TableProps<MaintenanceTaskResponse>['columns'] = [
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
      title: 'Tasks',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
    },
  ];

  const columns: TableProps<MaintenanceTaskResponse>['columns'] = [
    {
      title: 'Tasks',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
    },
    {
      title: userRole === StaffType.SUPERADMIN ? 'Asset/Facility' : 'Location',
      render: (_, record) => (
        <div>
          {record.parkAsset && <p className="font-semibold">{record.parkAsset.name}</p>}
          {record.facility && <p className="font-semibold">{record.facility.name}</p>}
          {record.sensor && <p className="font-semibold">{record.sensor.name}</p>}
          {record.hub && <p className="font-semibold">{record.hub.name}</p>}
        </div>
      ),
    },
    {
      title: 'Task Type',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (text) => {
        switch (text) {
          case 'INSPECTION':
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
          record.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
          record.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED;
        const isDueSoon =
          moment(text).startOf('day').isSameOrBefore(moment().startOf('day').add(3, 'days')) &&
          record.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
          record.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED;
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

  ];

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
                <Button type="dashed" className="-mt-[1px] rounded-0 text-secondary" onClick={() => navigate('maintenance-tasks')}>
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
        {overdueTasks && overdueTasks?.length > 0 ? (
          <div className="flex flex-col w-full">
            <div className="flex items-center font-semibold text-error">
              <div className={`bg-red-400 text-white h-6 w-6 flex justify-center items-center rounded-full mr-2`}>
                {overdueTasks.length}
              </div>
              Overdue Tasks
            </div>
            <Table
              dataSource={overdueTasks.slice(0, 3)}
              columns={columns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: SCREEN_LG }}
              {...tableProps}
            />
            {overdueTasks?.length > 3 && (
              <Button type="dashed" className="-mt-[1px] rounded-0 text-secondary" onClick={() => navigate('maintenance-tasks')}>
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

export default MaintenanceTasksTable;
