import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message, Row, Col, Statistic, Radio, Select, Collapse } from 'antd';
import moment from 'moment';
import { FiExternalLink, FiEye, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import {
  getAllPlantTasks,
  PlantTaskResponse,
  StaffType,
  StaffResponse,
  deletePlantTask,
  PlantTaskTypeEnum,
  PlantTaskStatusEnum,
  assignPlantTask,
  getAllStaffsByParkId,
  getAllStaffs,
} from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { Typography } from 'antd';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { COLORS } from '../../config/colors';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PlantTaskCategories from './PlantTaskCategories';
import PlantTaskDashboard from './PlantTaskDashboard';

const { Panel } = Collapse;

// Utility function to format task type
const formatTaskType = (taskType: string) => {
  return formatEnumLabelToRemoveUnderscores(taskType);
};

const PlantTaskList: React.FC = () => {
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [plantTaskToBeDeleted, setPlantTaskToBeDeleted] = useState<PlantTaskResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewMode, setViewMode] = useState<'categories' | 'table'>('categories');
  const [tableViewType, setTableViewType] = useState<'all' | 'grouped-status' | 'grouped-urgency'>('all');

  const [open, setOpen] = useState<PlantTaskResponse[]>([]);
  const [inProgress, setInProgress] = useState<PlantTaskResponse[]>([]);
  const [completed, setCompleted] = useState<PlantTaskResponse[]>([]);
  const [cancelled, setCancelled] = useState<PlantTaskResponse[]>([]);

  const [staffList, setStaffList] = useState<StaffResponse[]>([]);

  useEffect(() => {
    fetchPlantTasks();
    fetchStaffList();
  }, []);

  const fetchPlantTasks = async () => {
    try {
      const response = await getAllPlantTasks();
      setPlantTasks(response.data);

      // Sort tasks by position before setting the state
      const sortedTasks = response.data.sort((a, b) => a.position - b.position);

      // set filtered tables
      setOpen(sortedTasks.filter((task) => task.taskStatus === 'OPEN'));
      setInProgress(sortedTasks.filter((task) => task.taskStatus === 'IN_PROGRESS'));
      setCompleted(sortedTasks.filter((task) => task.taskStatus === 'COMPLETED'));
      setCancelled(sortedTasks.filter((task) => task.taskStatus === 'CANCELLED'));
    } catch (error) {
      console.error('Error fetching plant tasks:', error);
      messageApi.error('Failed to fetch plant tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllStaffs();
      } else {
        response = await getAllStaffsByParkId(user?.parkId);
      }
      const filteredStaff = response.data.filter((staff) => staff.role === StaffType.ARBORIST || staff.role === StaffType.BOTANIST);
      setStaffList(filteredStaff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      messageApi.error('Failed to fetch staff list');
    }
  };

  const handleAssignStaff = async (plantTaskId: string, staffId: string) => {
    try {
      await assignPlantTask(plantTaskId, user?.id || '', staffId);
      messageApi.success('Staff assigned successfully');
      fetchPlantTasks();
    } catch (error) {
      console.error('Error assigning staff:', error);
      messageApi.error('Failed to assign staff');
    }
  };

  const filteredPlantTasks = useMemo(() => {
    return plantTasks.filter((plantTask) =>
      Object.values(plantTask).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, plantTasks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (plantTaskId: string) => {
    navigate(`/plant-tasks/${plantTaskId}`);
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
      title: user?.role === StaffType.SUPERADMIN ? 'Park, Zone' : 'Zone',
      render: (_, record) => (
        <div>
          {user?.role === StaffType.SUPERADMIN && <p className="font-semibold">{record.occurrence.zone.park.name}</p>}
          <div className="flex">
            {user?.role === StaffType.SUPERADMIN && <p className="opacity-50 mr-2">Zone:</p>}
            {record.occurrence.zone.name}
          </div>
        </div>
      ),
      sorter: (a, b) => {
        if (user?.role === StaffType.SUPERADMIN) {
          if (a.occurrence.zone.park.name && b.occurrence.zone.park.name) {
            return a.occurrence.zone.park.name.localeCompare(b.occurrence.zone.park.name);
          }
        }
        if (a.occurrence.zone.name && b.occurrence.zone.name) {
          return a.occurrence.zone.name.localeCompare(b.occurrence.zone.name);
        }
        return a.occurrence.zone.id.toString().localeCompare(b.occurrence.zone.id.toString());
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
      width: '10%',
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
        const isOverdue = moment().isAfter(moment(text)) && 
          record.taskStatus !== PlantTaskStatusEnum.COMPLETED && 
          record.taskStatus !== PlantTaskStatusEnum.CANCELLED;
        return (
          <Flex align="center">
            {moment(text).format('D MMM YY')}
            {isOverdue && <FiAlertCircle className="ml-2 text-red-500" />}
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
              <Tag color="default" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'IN_PROGRESS':
            return (
              <Tag color="blue" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'COMPLETED':
            return (
              <Tag color="green" bordered={false}>
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
      width: '10%',
    },
    {
      title: 'Assigned Staff',
      key: 'assignedStaff',
      render: (_, record) => {
        if (record.assignedStaff) {
          return `${record.assignedStaff.firstName} ${record.assignedStaff.lastName}`;
        } else {
          return (
            <Select style={{ width: 200 }} placeholder="Assign staff" onChange={(value) => handleAssignStaff(record.id, value)}>
              {staffList.map((staff) => (
                <Select.Option key={staff.id} value={staff.id}>
                  {`${staff.firstName} ${staff.lastName}`}
                </Select.Option>
              ))}
            </Select>
          );
        }
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Plant Task">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
          <Tooltip title="Edit Plant Task">
            <Button type="link" icon={<RiEdit2Line />} onClick={() => navigate(`/plant-tasks/${record.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete Plant Task">
            <Button danger type="link" icon={<MdDeleteOutline className="text-error" />} onClick={() => showDeleteModal(record)} />
          </Tooltip>
        </Flex>
      ),
      width: '10%',
    },
  ];

  const showDeleteModal = (plantTask: PlantTaskResponse) => {
    setDeleteModalOpen(true);
    setPlantTaskToBeDeleted(plantTask);
  };

  const cancelDelete = () => {
    setPlantTaskToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const deletePlantTaskConfirmed = async () => {
    try {
      if (!plantTaskToBeDeleted) {
        throw new Error('Unable to delete Plant Task at this time');
      }
      await deletePlantTask(plantTaskToBeDeleted.id);
      fetchPlantTasks();
      setPlantTaskToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.success(`Deleted Plant Task: ${plantTaskToBeDeleted.title}.`);
    } catch (error) {
      console.error(error);
      setPlantTaskToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.error('Unable to delete Plant Task at this time. Please try again later.');
    }
  };

  const breadcrumbItems = [
    {
      title: 'Plant Task Management',
      pathKey: '/plant-tasks',
      isMain: true,
      isCurrent: true,
    },
  ];

  const renderDashboardOverview = () => {
    return (
      <Collapse defaultActiveKey={['1']} className="mb-4 bg-white">
        <Panel header="Task Dashboard" key="1">
          <PlantTaskDashboard plantTasks={plantTasks} />
        </Panel>
      </Collapse>
    );
  };

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
      <Collapse defaultActiveKey={Object.keys(groupedTasks).slice(0, 2)}>
        {Object.entries(groupedTasks).map(([key, tasks]) => (
          <Panel header={`${formatEnumLabelToRemoveUnderscores(key)} (${tasks.length})`} key={key}>
            <Table
              dataSource={tasks}
              columns={columns.filter((col) => col.key !== (groupBy === 'status' ? 'taskStatus' : 'taskUrgency'))}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: SCREEN_LG }}
              {...tableProps}
            />
          </Panel>
        ))}
      </Collapse>
    );
  };

  const renderTableView = () => {
    const tableProps = {
      rowClassName: (record: PlantTaskResponse) => {
        return moment().isAfter(moment(record.dueDate)) && 
          (record.taskStatus !== PlantTaskStatusEnum.COMPLETED && 
           record.taskStatus !== PlantTaskStatusEnum.CANCELLED) 
          ? 'overdue-row' 
          : '';
      },
    };

    switch (tableViewType) {
      case 'grouped-status':
        return renderGroupedTasks('status', tableProps);
      case 'grouped-urgency':
        return renderGroupedTasks('urgency', tableProps);
      default:
        return (
          <Card>
            <Table
              dataSource={filteredPlantTasks}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: SCREEN_LG }}
              {...tableProps}
            />
          </Card>
        );
    }
  };

  const renderContent = () => {
    return viewMode === 'categories' ? (
      <PlantTaskCategories
        open={open}
        inProgress={inProgress}
        completed={completed}
        cancelled={cancelled}
        setOpen={setOpen}
        setCompleted={setCompleted}
        setInProgress={setInProgress}
        setCancelled={setCancelled}
        refreshData={fetchPlantTasks}
      />
    ) : (
      renderTableView()
    );
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      {renderDashboardOverview()}
      <Flex justify="space-between" align="center" className="mb-4">
        <Flex align="center">
          <Radio.Group
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value);
              if (e.target.value === 'categories') {
                setTableViewType('all');
              }
            }}
          >
            <Radio.Button value="categories">Board View</Radio.Button>
            <Radio.Button value="table">Table View</Radio.Button>
          </Radio.Group>
          {viewMode === 'table' && (
            <Select value={tableViewType} onChange={setTableViewType} style={{ width: 200, marginLeft: 16 }}>
              <Select.Option value="all">All Tasks</Select.Option>
              <Select.Option value="grouped-status">Grouped by Status</Select.Option>
              <Select.Option value="grouped-urgency">Grouped by Urgency</Select.Option>
            </Select>
          )}
        </Flex>
        <Flex gap={10}>
          <Input
            suffix={<FiSearch />}
            placeholder="Search in Plant Tasks..."
            className="bg-white"
            variant="filled"
            onChange={handleSearch}
          />
          <Button
            type="primary"
            onClick={() => {
              navigate('/plant-tasks/create');
            }}
          >
            Create Plant Tak
          </Button>
        </Flex>
      </Flex>
      {renderContent()}
      <ConfirmDeleteModal
        onConfirm={deletePlantTaskConfirmed}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this Plant Task?"
      />
    </ContentWrapperDark>
  );
};

export default PlantTaskList;