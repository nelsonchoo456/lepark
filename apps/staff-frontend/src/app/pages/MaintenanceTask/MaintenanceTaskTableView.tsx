import React, { useState, useEffect } from 'react';
import { Table, TableProps, Tag, Flex, Tooltip, Button, Select, Collapse, Modal, Form, Input, DatePicker, message, Tabs, Card } from 'antd';
import moment from 'moment';
import { FiEye, FiAlertCircle, FiClock } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import {
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  MaintenanceTaskTypeEnum,
  StaffResponse,
  StaffType,
  getAllParks,
  updateMaintenanceTaskDetails,
  MaintenanceTaskUpdateData,
  assignMaintenanceTask,
  unassignMaintenanceTask,
  updateMaintenanceTaskStatus,
} from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { SCREEN_LG } from '../../config/breakpoints';
import { CloseOutlined } from '@ant-design/icons';
import { useAuth } from '@lepark/common-ui';
import EditMaintenanceTaskModal from './EditMaintenanceTaskModal';
import ViewMaintenanceTaskModal from './ViewMaintenanceTaskModal';
import { TabsNoBottomMargin } from '../Asset/AssetListSummary';
import { COLORS } from '../../config/colors';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Utility function to format task type
const formatTaskType = (taskType: string) => {
  return formatEnumLabelToRemoveUnderscores(taskType);
};

interface MaintenanceTaskTableViewProps {
  maintenanceTasks: MaintenanceTaskResponse[];
  loading: boolean;
  staffList: StaffResponse[];
  tableViewType: 'all' | 'grouped-status' | 'grouped-urgency';
  userRole: string;
  handleAssignStaff: (maintenanceTaskId: string, staffId: string) => void;
  navigateToDetails: (maintenanceTaskId: string) => void;
  navigate: (path: string) => void;
  showDeleteModal: (maintenanceTask: MaintenanceTaskResponse) => void;
  handleUnassignStaff: (maintenanceTaskId: string, staffId: string) => void;
  onTaskUpdated: () => void; // Add this prop to refresh the task list after update
  handleStatusChange: (newStatus: MaintenanceTaskStatusEnum) => void;
}

const MaintenanceTaskTableView: React.FC<MaintenanceTaskTableViewProps> = ({
  maintenanceTasks,
  loading,
  staffList,
  tableViewType,
  userRole,
  handleAssignStaff,
  navigateToDetails,
  navigate,
  showDeleteModal,
  handleUnassignStaff,
  onTaskUpdated,
  handleStatusChange,
}) => {
  const [parks, setParks] = useState<{ text: string; value: number }[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTaskResponse | null>(null);
  const [form] = Form.useForm();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTaskResponse | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  useEffect(() => {
    fetchParks();
  }, []);

  useEffect(() => {
    // Update active keys when tableViewType changes
    if (tableViewType === 'grouped-status' || tableViewType === 'grouped-urgency') {
      const groupKeys = tableViewType === 'grouped-status' ? ['OPEN', 'IN_PROGRESS'] : ['IMMEDIATE', 'HIGH'];
      setActiveKeys(groupKeys);
    }
  }, [tableViewType]);

  const fetchParks = async () => {
    try {
      const response = await getAllParks();
      const parkOptions = response.data.map((park) => ({
        text: park.name,
        value: park.id,
      }));
      setParks(parkOptions);
    } catch (error) {
      console.error('Error fetching parks:', error);
    }
  };

  const showEditModal = (task: MaintenanceTaskResponse) => {
    setEditingTask(task);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: MaintenanceTaskUpdateData) => {
    if (editingTask) {
      try {
        await updateMaintenanceTaskDetails(editingTask.id, values);
        message.success('Task updated successfully');
        setEditModalVisible(false);
        onTaskUpdated(); // Refresh the task list
      } catch (error) {
        console.error('Error updating maintenance task:', error);
        throw new Error('Failed to update task.' + ' ' + error + '.');
        // The modal will remain open as we're not calling setEditModalVisible(false) here
      }
    }
  };

  const showViewModal = (task: MaintenanceTaskResponse) => {
    setSelectedTask(task);
    setViewModalVisible(true);
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
  };

  const filterTasksByDateRange = (tasks: MaintenanceTaskResponse[]) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return tasks;
    }
    const [startDate, endDate] = dateRange;
    return tasks.filter(task => {
      const dueDate = dayjs(task.dueDate);
      return (dueDate.isSame(startDate, 'day') || dueDate.isAfter(startDate, 'day')) && (dueDate.isSame(endDate, 'day') || dueDate.isBefore(endDate, 'day'));
    });
  };

  const filteredMaintenanceTasks = filterTasksByDateRange(maintenanceTasks);

  const handleTakeTask = async (taskId: string) => {
    try {
      await assignMaintenanceTask(taskId, user?.id || '');
      await updateMaintenanceTaskStatus(taskId, MaintenanceTaskStatusEnum.IN_PROGRESS, user?.id);
      message.success('Task assigned and updated successfully');
      onTaskUpdated();
    } catch (error) {
      console.error('Error taking task:', error);
      message.error('Failed to take task');
    }
  };

  const handleReturnTask = async (taskId: string) => {
    try {
      await unassignMaintenanceTask(taskId, user?.id || '');
      await updateMaintenanceTaskStatus(taskId, MaintenanceTaskStatusEnum.OPEN);
      message.success('Task unassigned and updated successfully');
      onTaskUpdated();
    } catch (error) {
      console.error('Error returning task:', error);
      message.error('Failed to return task');
    }
  };

  const limitedToSubmittingTasksOnly =
    user?.role === StaffType.MANAGER || user?.role === StaffType.ARBORIST || user?.role === StaffType.BOTANIST || user?.role === StaffType.PARK_RANGER || user?.role === StaffType.LANDSCAPE_ARCHITECT;

  // Filter tasks based on status and user
  const filteredTasks = maintenanceTasks.filter(task => {
    if (task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.CANCELLED) {
      return true;
    }
    if (task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS || task.taskStatus === MaintenanceTaskStatusEnum.COMPLETED) {
      return task.assignedStaff?.id === user?.id;
    }
    return false;
  });

  const columns: TableProps<MaintenanceTaskResponse>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: '20%',
    },
    {
      title: userRole === StaffType.SUPERADMIN ? 'Park, Location' : 'Location',
      render: (_, record) => {
        const getFacilityName = () => {
          if (record.parkAsset?.facility) return record.parkAsset.facility.name;
          if (record.sensor?.facility) return record.sensor.facility.name;
          if (record.hub?.facility) return record.hub.facility.name;
          if (record.facility) return record.facility.name;
          return 'N/A';
        };

        return (
          <div>
            {userRole === StaffType.SUPERADMIN && <p className="font-semibold">{record.submittingStaff?.park?.name}</p>}
            <div className="flex">
              {userRole !== StaffType.SUPERADMIN && <p className="opacity-50 mr-2"></p>}
              {getFacilityName()}
            </div>
          </div>
        );
      },
      sorter: (a, b) => {
        const getFacilityName = (record: MaintenanceTaskResponse) => {
          if (record.parkAsset?.facility) return record.parkAsset.facility.name;
          if (record.sensor?.facility) return record.sensor.facility.name;
          if (record.hub?.facility) return record.hub.facility.name;
          if (record.facility) return record.facility.name;
          return '';
        };

        if (userRole === StaffType.SUPERADMIN) {
          const parkCompare = (a.submittingStaff?.park?.name || '').localeCompare(b.submittingStaff?.park?.name || '');
          if (parkCompare !== 0) return parkCompare;
        }
        return getFacilityName(a).localeCompare(getFacilityName(b));
      },
      filters: userRole === StaffType.SUPERADMIN
        ? parks
        : Object.values(
            filteredMaintenanceTasks.reduce((acc, task) => {
              let facilityName, facilityId;
              if (task.parkAsset?.facility) {
                facilityName = task.parkAsset.facility.name;
                facilityId = task.parkAsset.facility.id;
              } else if (task.sensor?.facility) {
                facilityName = task.sensor.facility.name;
                facilityId = task.sensor.facility.id;
              } else if (task.hub?.facility) {
                facilityName = task.hub.facility.name;
                facilityId = task.hub.facility.id;
              } else if (task.facility) {
                facilityName = task.facility.name;
                facilityId = task.facility.id;
              }
              if (facilityName && facilityId) {
                acc[facilityId] = { text: facilityName, value: facilityId.toString() };
              }
              return acc;
            }, {} as Record<string, { text: string; value: string }>)
          ),
      onFilter: (value, record) => {
        if (userRole === StaffType.SUPERADMIN) {
          return record.submittingStaff?.park?.id === value;
        } else {
          return (
            (record.parkAsset?.facility?.id === value) ||
            (record.sensor?.facility?.id === value) ||
            (record.hub?.facility?.id === value) ||
            (record.facility?.id === value)
          );
        }
      },
      width: '15%',
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
      filters: Object.values(MaintenanceTaskTypeEnum).map((type) => ({
        text: formatTaskType(type),
        value: type,
      })),
      onFilter: (value, record) => record.taskType === value,
      width: '15%',
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
      filters: [
        { text: formatEnumLabelToRemoveUnderscores('IMMEDIATE'), value: 'IMMEDIATE' },
        { text: formatEnumLabelToRemoveUnderscores('HIGH'), value: 'HIGH' },
        { text: formatEnumLabelToRemoveUnderscores('NORMAL'), value: 'NORMAL' },
        { text: formatEnumLabelToRemoveUnderscores('LOW'), value: 'LOW' },
      ],
      onFilter: (value, record) => record.taskUrgency === value,
      width: '1%',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
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
      sorter: (a, b) => moment(a.dueDate).valueOf() - moment(b.dueDate).valueOf(),
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
      filters: [
        { text: formatEnumLabelToRemoveUnderscores('OPEN'), value: 'OPEN' },
        { text: formatEnumLabelToRemoveUnderscores('IN_PROGRESS'), value: 'IN_PROGRESS' },
        { text: formatEnumLabelToRemoveUnderscores('COMPLETED'), value: 'COMPLETED' },
        { text: formatEnumLabelToRemoveUnderscores('CANCELLED'), value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.taskStatus === value,
      width: '1%',
    },
    {
      title: 'Assigned Staff',
      key: 'assignedStaff',
      render: (_, record) => {
        if (record.assignedStaff) {
          return (
            <Flex align="center" justify="space-between">
              <span>{`${record.assignedStaff.firstName} ${record.assignedStaff.lastName}`}</span>
              {record.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS && record.assignedStaff.id === user?.id && (
                <Button
                  type="link"
                  onClick={() => handleReturnTask(record.id)}
                  size="small"
                >
                  Return Task
                </Button>
              )}
            </Flex>
          );
        } else {
          return record.taskStatus === MaintenanceTaskStatusEnum.OPEN && (userRole === StaffType.VENDOR_MANAGER) ? (
            <Button
              type="link"
              onClick={() => handleTakeTask(record.id)}
              size="small"
            >
              Take Task
            </Button>
          ) : (
            <></>
          );
        }
      },
      filters: staffList.map((staff) => ({
        text: `${staff.firstName} ${staff.lastName}`,
        value: staff.id,
      })),
      onFilter: (value, record) => record.assignedStaff?.id === value,
      width: '15%',
    },
    {
      title: 'Submitting Staff',
      key: 'submittingStaff',
      render: (_, record) => `${record.submittingStaff.firstName} ${record.submittingStaff.lastName}`,
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center">
          <Tooltip title="View Maintenance Task">
            <Button type="link" icon={<FiEye />} onClick={() => showViewModal(record)} />
          </Tooltip>
          {!limitedToSubmittingTasksOnly && (record.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED && record.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED) && (
            <Tooltip title="Edit Maintenance Task">
              <Button type="link" icon={<RiEdit2Line />} onClick={() => showEditModal(record)} />
            </Tooltip>
          )}
          {(userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER || userRole === StaffType.VENDOR_MANAGER) && (
            <Tooltip title="Delete Maintenance Task">
              <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
            </Tooltip>
          )}
        </Flex>
      ),
      width: '1%',
    },
  ];

  const renderGroupedTasks = (groupBy: 'status' | 'urgency', tableProps: any) => {
    const groupedTasks =
      groupBy === 'status'
        ? {
            OPEN: filteredTasks.filter((task) => task.taskStatus === 'OPEN'),
            IN_PROGRESS: filteredTasks.filter((task) => task.taskStatus === 'IN_PROGRESS'),
            COMPLETED: filteredTasks.filter((task) => task.taskStatus === 'COMPLETED'),
            CANCELLED: filteredTasks.filter((task) => task.taskStatus === 'CANCELLED'),
          }
        : {
            IMMEDIATE: filteredTasks.filter((task) => task.taskUrgency === 'IMMEDIATE'),
            HIGH: filteredTasks.filter((task) => task.taskUrgency === 'HIGH'),
            NORMAL: filteredTasks.filter((task) => task.taskUrgency === 'NORMAL'),
            LOW: filteredTasks.filter((task) => task.taskUrgency === 'LOW'),
          };

    return (
      <TabsNoBottomMargin
        defaultActiveKey="1"
        type="card"
        items={Object.entries(groupedTasks).map(([key, tasks]) => ({
          key,
          label: `${formatEnumLabelToRemoveUnderscores(key)} (${tasks.length})`,
          children: (
            <Card styles={{ body: { padding: 0 } }} className="p-4 border-t-0 rounded-tl-none">
              <Table
                dataSource={tasks}
                columns={columns?.filter((col) => col.key !== (groupBy === 'status' ? 'taskStatus' : 'taskUrgency'))}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: SCREEN_LG }}
                {...tableProps}
              />
            </Card>
          ),
        }))}
      />
    );
  };

  const tableProps = {
    rowClassName: (record: MaintenanceTaskResponse) => {
      const isOverdue =
        moment().startOf('day').isAfter(moment(record.dueDate).startOf('day')) &&
        record.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
        record.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED;
      const isDueSoon =
        moment(record.dueDate).startOf('day').isSameOrBefore(moment().startOf('day').add(3, 'days')) &&
        record.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
        record.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED;

      if (isOverdue) return 'overdue-row';
      if (isDueSoon) return 'due-soon-row';
      return '';
    },
  };

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <RangePicker
          onChange={handleDateRangeChange}
          style={{ width: '100%' }}
          placeholder={['Start Date', 'End Date']}
        />
      </div>
      {tableViewType === 'grouped-status' && renderGroupedTasks('status', tableProps)}
      {tableViewType === 'grouped-urgency' && renderGroupedTasks('urgency', tableProps)}
      {tableViewType === 'all' && (
        <Card styles={{ body: { padding: '1rem' } }}>
          <Table
            dataSource={filteredTasks}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: SCREEN_LG }}
            {...tableProps}
          />
        </Card>
      )}
      {/* Move the modals outside of the conditional rendering */}
      <EditMaintenanceTaskModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        initialValues={editingTask}
        userRole={userRole as StaffType}
        onStatusChange={handleStatusChange}
      />
      <ViewMaintenanceTaskModal
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        task={selectedTask}
        userRole={userRole as StaffType}
      />
    </>
  );
};

export default MaintenanceTaskTableView;
