import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Table, TableProps, Tag, Flex, Tooltip, message } from 'antd';
import moment from 'moment';
import { FiExternalLink, FiEye, FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import { getAllPlantTasks, PlantTaskResponse, StaffType, StaffResponse, deletePlantTask, PlantTaskTypeEnum } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { MdDeleteOutline } from 'react-icons/md';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { SCREEN_LG } from '../../config/breakpoints';
import { Typography } from 'antd';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

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

  useEffect(() => {
    fetchPlantTasks();
  }, []);

  const fetchPlantTasks = async () => {
    try {
      const response = await getAllPlantTasks();
      console.log('plant tasks', response.data);
      setPlantTasks(response.data);
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
      width: '25%',
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
                IMMEDIATE
              </Tag>
            );
          case 'HIGH':
            return (
              <Tag color="orange" bordered={false}>
                HIGH
              </Tag>
            );
          case 'NORMAL':
            return (
              <Tag color="blue" bordered={false}>
                NORMAL
              </Tag>
            );
          case 'LOW':
            return (
              <Tag color="green" bordered={false}>
                LOW
              </Tag>
            );
          default:
            return <Tag>{text}</Tag>;
        }
      },
      filters: [
        { text: 'IMMEDIATE', value: 'IMMEDIATE' },
        { text: 'HIGH', value: 'HIGH' },
        { text: 'NORMAL', value: 'NORMAL' },
        { text: 'LOW', value: 'LOW' },
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
              <Tag color="orange" bordered={false}>
                OPEN
              </Tag>
            );
          case 'IN_PROGRESS':
            return (
              <Tag color="blue" bordered={false}>
                IN PROGRESS
              </Tag>
            );
          case 'COMPLETED':
            return (
              <Tag color="green" bordered={false}>
                COMPLETED
              </Tag>
            );
          case 'CANCELLED':
            return (
              <Tag color="gray" bordered={false}>
                CANCELLED
              </Tag>
            );
          default:
            return <Tag>{text}</Tag>;
        }
      },
      filters: [
        { text: 'OPEN', value: 'OPEN' },
        { text: 'IN_PROGRESS', value: 'IN_PROGRESS' },
        { text: 'COMPLETED', value: 'COMPLETED' },
        { text: 'CANCELLED', value: 'CANCELLED' },
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

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <ConfirmDeleteModal
        onConfirm={deletePlantTaskConfirmed}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this Plant Task?"
      />
      <Flex justify="end" gap={10}>
        <Input
          suffix={<FiSearch />}
          placeholder="Search in Plant Tasks..."
          className="mb-4 bg-white"
          variant="filled"
          onChange={handleSearch}
        />
        <Button
          type="primary"
          onClick={() => {
            navigate('/plant-tasks/create');
          }}
        >
          Create Plant Task
        </Button>
      </Flex>

      <Card>
        <Table dataSource={filteredPlantTasks} columns={columns} rowKey="id" loading={loading} scroll={{ x: SCREEN_LG }} />
      </Card>
    </ContentWrapperDark>
  );
};

export default PlantTaskList;
