import React, { useState, useEffect } from 'react';
import { Table, TableProps, Tag, Flex, Tooltip, Button, Select, Collapse, Modal, Form, Input, DatePicker, Tabs, Card } from 'antd';
import moment from 'moment';
import { FiEye, FiAlertCircle, FiClock } from 'react-icons/fi';
import { RiEdit2Line } from 'react-icons/ri';
import { MdDeleteOutline } from 'react-icons/md';
import { PlantTaskResponse, PlantTaskStatusEnum, PlantTaskTypeEnum, StaffResponse, StaffType, getAllParks, updatePlantTaskDetails, PlantTaskUpdateData } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { SCREEN_LG } from '../../config/breakpoints';
import { CloseOutlined } from '@ant-design/icons';
import { useAuth } from '@lepark/common-ui';
import EditPlantTaskModal from './EditPlantTaskModal';
import { TabsNoBottomMargin } from '../Asset/AssetListSummary';
import { COLORS } from '../../config/colors';

const { Panel } = Collapse;
const { TabPane } = Tabs;

// Utility function to format task type
const formatTaskType = (taskType: string) => {
  return formatEnumLabelToRemoveUnderscores(taskType);
};

interface PlantTaskTableViewProps {
  plantTasks: PlantTaskResponse[];
  loading: boolean;
  staffList: StaffResponse[];
  tableViewType: 'all' | 'grouped-status' | 'grouped-urgency';
  userRole: string;
  handleAssignStaff: (plantTaskId: string, staffId: string) => void;
  navigateToDetails: (plantTaskId: string) => void;
  navigate: (path: string) => void;
  showDeleteModal: (plantTask: PlantTaskResponse) => void;
  handleUnassignStaff: (plantTaskId: string, staffId: string) => void;
  onTaskUpdated: () => void; // Add this prop to refresh the task list after update
}

const PlantTaskTableView: React.FC<PlantTaskTableViewProps> = ({
  plantTasks,
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
}) => {
  const [parks, setParks] = useState<{ text: string; value: number }[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<PlantTaskResponse | null>(null);
  const [form] = Form.useForm();

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

  const showEditModal = (task: PlantTaskResponse) => {
    setEditingTask(task);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: PlantTaskUpdateData) => {
    if (editingTask) {
      try {
        await updatePlantTaskDetails(editingTask.id, values);
        setEditModalVisible(false);
        onTaskUpdated(); // Refresh the task list
      } catch (error) {
        console.error('Error updating plant task:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  const columns: TableProps<PlantTaskResponse>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: '20%',
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
      sorter: (a, b) => {
        if (userRole === StaffType.SUPERADMIN) {
          if (a.occurrence?.zone?.park?.name && b.occurrence?.zone?.park?.name) {
            return a.occurrence?.zone?.park?.name.localeCompare(b.occurrence?.zone?.park?.name);
          }
        }
        if (a.occurrence?.zone?.name && b.occurrence?.zone?.name) {
          return a.occurrence?.zone?.name.localeCompare(b.occurrence?.zone?.name);
        }
        return a.occurrence?.zone?.id?.toString().localeCompare(b.occurrence?.zone?.id?.toString());
      },
      filters: parks,
      onFilter: (value, record) => record.occurrence.zone.park.id === value,
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
      filters: Object.values(PlantTaskTypeEnum).map((type) => ({
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
          moment().isAfter(moment(text)) &&
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        const isDueSoon =
          moment(text).isBetween(moment(), moment().add(3, 'days')) &&
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        return (
          <Flex align="center">
            {moment(text).format('D MMM YY')}
            {isOverdue && <FiAlertCircle className="ml-2 text-red-500" />}
            {isDueSoon && <FiClock className="ml-2 text-yellow-500" />}
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
              {(userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER) &&
                record.taskStatus === PlantTaskStatusEnum.OPEN && (
                  <Tooltip title="Unassign staff">
                    <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => handleUnassignStaff(record.id, user?.id || '')}
                    size="small"
                  />
                </Tooltip>
              )}
            </Flex>
          );
        } else {
          return record.taskStatus === PlantTaskStatusEnum.OPEN ? (
            <Select style={{ width: 200 }} placeholder="Assign staff" onChange={(value) => handleAssignStaff(record.id, value)}>
              {staffList
                .filter((staff) => staff.parkId === record.occurrence?.zone?.parkId)
                .map((staff: StaffResponse) => (
                  <Select.Option key={staff.id} value={staff.id}>
                    {`${staff.firstName} ${staff.lastName} - ${staff.role}`}
                  </Select.Option>
                ))}
            </Select>
          ) : (
            <></>
          );
        }
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" >
          <Tooltip title="View Plant Task">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          {record.taskStatus !== PlantTaskStatusEnum.COMPLETED && record.taskStatus !== PlantTaskStatusEnum.CANCELLED && (
            <Tooltip title="Edit Plant Task">
              <Button type="link" icon={<RiEdit2Line />} onClick={() => showEditModal(record)} />
            </Tooltip>
          )}
          {(userRole === StaffType.SUPERADMIN || userRole === StaffType.MANAGER) && (
            <Tooltip title="Delete Plant Task">
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
            OPEN: plantTasks.filter((task) => task.taskStatus === 'OPEN'),
            IN_PROGRESS: plantTasks.filter((task) => task.taskStatus === 'IN_PROGRESS'),
            COMPLETED: plantTasks.filter((task) => task.taskStatus === 'COMPLETED'),
            CANCELLED: plantTasks.filter((task) => task.taskStatus === 'CANCELLED'),
          }
        : {
            IMMEDIATE: plantTasks.filter((task) => task.taskUrgency === 'IMMEDIATE'),
            HIGH: plantTasks.filter((task) => task.taskUrgency === 'HIGH'),
            NORMAL: plantTasks.filter((task) => task.taskUrgency === 'NORMAL'),
            LOW: plantTasks.filter((task) => task.taskUrgency === 'LOW'),
          };

    return (
      <TabsNoBottomMargin defaultActiveKey="1" type="card">
        {Object.entries(groupedTasks).map(([key, tasks]) => (
          <TabPane tab={`${formatEnumLabelToRemoveUnderscores(key)} (${tasks.length})`} key={key}>
            <Card styles={{ body: { padding: 0 } }} className="p-4 border-t-0 rounded-tl-none">
              <Table
                dataSource={tasks}
                columns={columns.filter((col) => col.key !== (groupBy === 'status' ? 'taskStatus' : 'taskUrgency'))}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: SCREEN_LG }}
                {...tableProps}
              />
            </Card>
          </TabPane>
        ))}
      </TabsNoBottomMargin>
    );
  };

  const tableProps = {
    rowClassName: (record: PlantTaskResponse) => {
      const isOverdue =
        moment().isAfter(moment(record.dueDate)) &&
        record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
        record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
      const isDueSoon =
        moment(record.dueDate).isBetween(moment(), moment().add(3, 'days')) &&
        record.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
        record.taskStatus !== PlantTaskStatusEnum.CANCELLED;

      if (isOverdue) return 'overdue-row';
      if (isDueSoon) return 'due-soon-row';
      return '';
    },
  };

  switch (tableViewType) {
    case 'grouped-status':
      return renderGroupedTasks('status', tableProps);
    case 'grouped-urgency':
      return renderGroupedTasks('urgency', tableProps);
    default:
      return (
        <Card styles={{ body: { padding: "1rem" }}}>
          <Table
            dataSource={plantTasks}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: SCREEN_LG }}
            {...tableProps}
          />
          <EditPlantTaskModal
            visible={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            onSubmit={handleEditSubmit}
            initialValues={editingTask}
          />
        </Card>
      );
  }
};

export default PlantTaskTableView;