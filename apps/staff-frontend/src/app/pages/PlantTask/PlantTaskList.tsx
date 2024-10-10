import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Flex, message, Radio, Select, Collapse } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import {
  getAllPlantTasks,
  PlantTaskResponse,
  StaffType,
  StaffResponse,
  deletePlantTask,
  assignPlantTask,
  getAllStaffsByParkId,
  getAllStaffs,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import PlantTaskCategories from './PlantTaskCategories';
import PlantTaskDashboard from './PlantTaskDashboard';
import PlantTaskTable from './PlantTaskTable';

const { Panel } = Collapse;

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

  const renderTableView = () => {
    return (
      <Card>
        <PlantTaskTable
          plantTasks={filteredPlantTasks}
          loading={loading}
          staffList={staffList}
          tableViewType={tableViewType}
          userRole={user?.role || ''}
          handleAssignStaff={handleAssignStaff}
          navigateToDetails={navigateToDetails}
          navigate={navigate}
          showDeleteModal={showDeleteModal}
        />
      </Card>
    );
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
          {viewMode === 'table' && (
            <Input
              suffix={<FiSearch />}
              placeholder="Search in Plant Tasks..."
              className="bg-white"
              variant="filled"
              onChange={handleSearch}
            />
          )}
          <Button
            type="primary"
            onClick={() => {
              navigate('/plant-tasks/create');
            }}
          >
            Create Plant Task
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