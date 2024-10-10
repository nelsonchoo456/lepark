import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message, Row, Col, Statistic, Radio } from 'antd';
import moment from 'moment';
import { FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import {
  getAllPlantTasks,
  PlantTaskResponse,
  StaffType,
  StaffResponse,
  deletePlantTask,
  PlantTaskTypeEnum,
  PlantTaskStatusEnum,
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

  const [open, setOpen] = useState<PlantTaskResponse[]>([]);
  const [inProgress, setInProgress] = useState<PlantTaskResponse[]>([]);
  const [completed, setCompleted] = useState<PlantTaskResponse[]>([]);
  const [cancelled, setCancelled] = useState<PlantTaskResponse[]>([]);

  useEffect(() => {
    fetchPlantTasks();
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
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (text) => moment(text).format('D MMM YY'),
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
    const openTasks = plantTasks.filter((task) => task.taskStatus === 'OPEN');
    const urgentTasks = openTasks.filter((task) => task.taskUrgency === 'IMMEDIATE' || task.taskUrgency === 'HIGH');
    const myTasks = plantTasks.filter((task) => task.assignedStaff?.id === user?.id);

    return (
      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Open Tasks" value={openTasks.length} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={8}>
            <Statistic title="Urgent Tasks" value={urgentTasks.length} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
          <Col span={8}>
            <Statistic title="My Tasks" value={myTasks.length} valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>
      </Card>
    );
  };

  const refreshData = () => {
    fetchPlantTasks();
  };

  const renderContent = () => {
    if (viewMode === 'categories') {
      return (
        <PlantTaskCategories 
          open={open} 
          inProgress={inProgress} 
          completed={completed} 
          cancelled={cancelled} 
          setOpen={setOpen} 
          setCompleted={setCompleted} 
          setInProgress={setInProgress} 
          setCancelled={setCancelled}
          refreshData={fetchPlantTasks} // Use fetchPlantTasks instead of refreshData
        />
      )
    } else {
      return (
        <Card>
          <Table dataSource={filteredPlantTasks} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
        </Card>
      );
    }
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      {renderDashboardOverview()}
      <Flex justify="space-between" align="center" className="mb-4">
        <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <Radio.Button value="categories">Categories</Radio.Button>
          <Radio.Button value="table">Table</Radio.Button>
        </Radio.Group>
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