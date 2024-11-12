import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableProps,
  Tag,
  Flex,
  Tooltip,
  Button,
  Select,
  Collapse,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Tabs,
  Card,
  Row,
  Col,
} from 'antd';
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
import { getStatusOrder } from '@lepark/data-utility';

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
  handleTakeTask: (maintenanceTaskId: string, staffId: string) => void;
  handleReturnTask: (maintenanceTaskId: string, staffId: string) => void;
  navigateToDetails: (maintenanceTaskId: string) => void;
  navigate: (path: string) => void;
  showDeleteModal: (maintenanceTask: MaintenanceTaskResponse) => void;
  onTaskUpdated: () => void; // Add this prop to refresh the task list after update
  handleStatusChange: (newStatus: MaintenanceTaskStatusEnum) => void;
  handleAssignTask: (maintenanceTaskId: string, staffId: string) => void;
  handleUnassignTask: (maintenanceTaskId: string, staffId: string) => void;
}

const MaintenanceTaskTableView: React.FC<MaintenanceTaskTableViewProps> = ({
  maintenanceTasks,
  loading,
  staffList,
  tableViewType,
  userRole,
  handleTakeTask,
  handleReturnTask,
  showDeleteModal,
  onTaskUpdated,
  handleStatusChange,
  handleAssignTask,
  handleUnassignTask,
}) => {
  const [parks, setParks] = useState<{ text: string; value: number }[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTaskResponse | null>(null);
  const [form] = Form.useForm();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTaskResponse | null>(null);

  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const [editedTask, setEditedTask] = useState<MaintenanceTaskResponse | null>(null);
  const [dueDateRange, setDueDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [completedDateRange, setCompletedDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

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

        // Check if the status has changed to trigger the log prompt
        if (values.taskStatus && values.taskStatus !== editingTask.taskStatus) {
          setEditedTask({
            ...editingTask,
            ...values,
            dueDate: values.dueDate || editingTask.dueDate, // Provide a fallback value
          });
          setShowLogPrompt(true);
        }
      } catch (error) {
        console.error('Error updating maintenance task:', error);
        throw new Error('Failed to update task.' + ' ' + error + '.');
      }
    }
  };

  const showViewModal = (task: MaintenanceTaskResponse) => {
    setSelectedTask(task);
    setViewModalVisible(true);
  };

  const handleDueDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDueDateRange(dates);
  };

  const handleCompletedDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setCompletedDateRange(dates);
  };

  const filterTasksByDateRange = (tasks: MaintenanceTaskResponse[]) => {
    return tasks.filter((task) => {
      let includeTask = true;

      if (dueDateRange && dueDateRange[0] && dueDateRange[1]) {
        const dueDate = dayjs(task.dueDate);
        includeTask =
          includeTask &&
          (dueDate.isSame(dueDateRange[0], 'day') || dueDate.isAfter(dueDateRange[0], 'day')) &&
          (dueDate.isSame(dueDateRange[1], 'day') || dueDate.isBefore(dueDateRange[1], 'day'));
      }

      if (completedDateRange && completedDateRange[0] && completedDateRange[1]) {
        const completedDate = dayjs(task.completedDate);
        includeTask =
          includeTask &&
          (completedDate.isSame(completedDateRange[0], 'day') || completedDate.isAfter(completedDateRange[0], 'day')) &&
          (completedDate.isSame(completedDateRange[1], 'day') || completedDate.isBefore(completedDateRange[1], 'day'));
      }

      return includeTask;
    });
  };

  const sortedTasks = useMemo(() => {
    return [...maintenanceTasks].sort((a, b) => {
      const statusOrderDiff = getStatusOrder(a.taskStatus) - getStatusOrder(b.taskStatus);
      if (statusOrderDiff !== 0) return statusOrderDiff;
      return dayjs(a.dueDate).diff(dayjs(b.dueDate));
    });
  }, [maintenanceTasks]);

  const filteredMaintenanceTasks = filterTasksByDateRange(sortedTasks);

  const limitedToSubmittingTasksOnly =
    user?.role === StaffType.ARBORIST ||
    user?.role === StaffType.BOTANIST ||
    user?.role === StaffType.PARK_RANGER ||
    user?.role === StaffType.LANDSCAPE_ARCHITECT;

  const handleTaskAction = async (task: MaintenanceTaskResponse, action: 'take' | 'return') => {
    try {
      if (action === 'take') {
        handleTakeTask(task.id, user?.id || '');
      } else {
        handleReturnTask(task.id, user?.id || '');
      }

      // Set the edited task and show the log prompt
      setEditedTask(task);
      setShowLogPrompt(true);
    } catch (error) {
      console.error(`Error ${action === 'take' ? 'taking' : 'returning'} task:`, error);
      message.error(`Failed to ${action} task`);
    }
  };

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
        return (
          <div>
            {userRole === StaffType.SUPERADMIN && <p className="font-semibold">{record.facilityOfFaultyEntity.park.name}</p>}
            <div className="flex">
              {userRole !== StaffType.SUPERADMIN && <p className="opacity-50 mr-2"></p>}
              {record.facilityOfFaultyEntity.name}
            </div>
          </div>
        );
      },
      sorter: (a, b) => {
        if (userRole === StaffType.SUPERADMIN) {
          const parkCompare = (a.facilityOfFaultyEntity.park.name || '').localeCompare(b.facilityOfFaultyEntity.park.name || '');
          if (parkCompare !== 0) return parkCompare;
        }
        return a.facilityOfFaultyEntity.name.localeCompare(b.facilityOfFaultyEntity.name);
      },
      filters:
        userRole === StaffType.SUPERADMIN
          ? parks
          : Object.values(
              filteredMaintenanceTasks.reduce((acc, task) => {
                const facilityName = task.facilityOfFaultyEntity?.name;
                const facilityId = task.facilityOfFaultyEntity?.id;
                if (facilityName && facilityId) {
                  acc[facilityId] = { text: facilityName, value: facilityId };
                }
                return acc;
              }, {} as Record<string, { text: string; value: string }>),
            ),
      onFilter: (value, record) => {
        if (userRole === StaffType.SUPERADMIN) {
          return record.facilityOfFaultyEntity.park.id === value;
        } else {
          return record.facilityOfFaultyEntity.id === value;
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
      title: 'Completed Date',
      dataIndex: 'completedDate',
      key: 'completedDate',
      render: (text) => (text ? moment(text).format('D MMM YY') : ''),
      width: '10%',
      sorter: (a, b) => moment(a.completedDate).valueOf() - moment(b.completedDate).valueOf(),
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
        const assignedStaffName = record.assignedStaff
          ? `${record.assignedStaff.firstName} ${record.assignedStaff.lastName}`
          : '';

        return (
          <Flex align="center" justify="space-between">
            <span>{assignedStaffName}</span>
            {userRole === StaffType.VENDOR_MANAGER && (
              <>
                {record.taskStatus === MaintenanceTaskStatusEnum.OPEN && !record.assignedStaff && (
                  <Button type="link" onClick={() => handleTaskAction(record, 'take')} size="small">
                    Take Task
                  </Button>
                )}
                {record.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS &&
                  record.assignedStaff?.id === user?.id && (
                    <Button type="link" onClick={() => handleTaskAction(record, 'return')} size="small">
                      Return Task
                    </Button>
                  )}
              </>
            )}
            {userRole === StaffType.SUPERADMIN && (
              <>
                {record.taskStatus === MaintenanceTaskStatusEnum.OPEN && (
                  <Select
                    style={{ width: 200 }}
                    placeholder="Assign staff"
                    onChange={(value) => handleAssignTask(record.id, value)}
                  >
                    {staffList
                      .filter(
                        (staff) =>
                          staff.parkId === record.submittingStaff.parkId &&
                          staff.role === StaffType.VENDOR_MANAGER
                      )
                      .map((staff: StaffResponse) => (
                        <Select.Option key={staff.id} value={staff.id}>
                          {`${staff.firstName} ${staff.lastName}`}
                        </Select.Option>
                      ))}
                  </Select>
                )}
                {record.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS && record.assignedStaff && (
                  <Tooltip title="Unassign staff">
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => handleUnassignTask(record.id, record.assignedStaff?.id || '')}
                      size="small"
                    />
                  </Tooltip>
                )}
              </>
            )}
          </Flex>
        );
      },
      filters: staffList
        .filter((staff) => staff.role === StaffType.VENDOR_MANAGER)
        .map((staff) => ({
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
          {!limitedToSubmittingTasksOnly && userRole !== StaffType.MANAGER && record.taskStatus === MaintenanceTaskStatusEnum.OPEN && (
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
            OPEN: filteredMaintenanceTasks.filter((task) => task.taskStatus === 'OPEN'),
            IN_PROGRESS: filteredMaintenanceTasks.filter((task) => task.taskStatus === 'IN_PROGRESS'),
            COMPLETED: filteredMaintenanceTasks.filter((task) => task.taskStatus === 'COMPLETED'),
            CANCELLED: filteredMaintenanceTasks.filter((task) => task.taskStatus === 'CANCELLED'),
          }
        : {
            IMMEDIATE: filteredMaintenanceTasks.filter((task) => task.taskUrgency === 'IMMEDIATE'),
            HIGH: filteredMaintenanceTasks.filter((task) => task.taskUrgency === 'HIGH'),
            NORMAL: filteredMaintenanceTasks.filter((task) => task.taskUrgency === 'NORMAL'),
            LOW: filteredMaintenanceTasks.filter((task) => task.taskUrgency === 'LOW'),
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

  const handleLogPromptOk = () => {
    setShowLogPrompt(false);
    if (editedTask) {
      let url = '';
      if (editedTask.facilityId) {
        url = `/facilities/${editedTask.facilityId}/edit`;
      } else if (editedTask.parkAssetId) {
        url = `/parkasset/${editedTask.parkAssetId}/edit`;
      } else if (editedTask.sensorId) {
        url = `/sensor/${editedTask.sensorId}/edit`;
      } else if (editedTask.hubId) {
        url = `/hubs/${editedTask.hubId}/edit`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setEditedTask(null);
  };

  const handleLogPromptCancel = () => {
    setShowLogPrompt(false);
    setEditedTask(null);
  };

  return (
    <>
      <Row justify="end" style={{ marginBottom: '16px' }}>
        <Col>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ marginRight: '8px' }}>Due Date Range:</span>
              <RangePicker onChange={handleDueDateRangeChange} style={{ width: '300px' }} placeholder={['Start Date', 'End Date']} />
            </div>
            <div>
              <span style={{ marginRight: '8px' }}>Completed Date Range:</span>
              <RangePicker onChange={handleCompletedDateRangeChange} style={{ width: '300px' }} placeholder={['Start Date', 'End Date']} />
            </div>
          </div>
        </Col>
      </Row>
      {tableViewType === 'grouped-status' && renderGroupedTasks('status', tableProps)}
      {tableViewType === 'grouped-urgency' && renderGroupedTasks('urgency', tableProps)}
      {tableViewType === 'all' && (
        <Card styles={{ body: { padding: '1rem' } }}>
          <Table
            dataSource={filteredMaintenanceTasks}
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
      <Modal
        title="Update Task"
        open={showLogPrompt}
        onOk={handleLogPromptOk}
        onCancel={handleLogPromptCancel}
        okText="Yes, edit status"
        cancelText="No, just update the task"
      >
        <p>
          Do you want to edit the status of the{' '}
          {editedTask?.parkAssetId ? 'Park Asset' : editedTask?.sensorId ? 'Sensor' : editedTask?.hubId ? 'Hub' : 'Facility'} "
          {editedTask?.parkAsset?.name || editedTask?.sensor?.name || editedTask?.hub?.name || editedTask?.facility?.name}"?
        </p>
      </Modal>
    </>
  );
};

export default MaintenanceTaskTableView;
