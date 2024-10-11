import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Flex, message, Radio, Select, Collapse, Row, Col, Statistic } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import {
  getAllPlantTasks,
  getPlantTasksByParkId,
  PlantTaskResponse,
  StaffType,
  StaffResponse,
  deletePlantTask,
  assignPlantTask,
  getAllStaffsByParkId,
  getAllStaffs,
  getAllAssignedPlantTasks,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import PlantTaskBoardView from './PlantTaskBoardView';
import PlantTaskDashboard from './PlantTaskDashboard/PlantTaskDashboard';
import PlantTaskTableView from './PlantTaskTableView';
import moment from 'moment';
import { Tabs } from 'antd';
import StaffWorkloadTable from './PlantTaskDashboard/components/StaffWorkloadTable';

const { Panel } = Collapse;
const { TabPane } = Tabs;

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

  const isSuperAdmin = user?.role === StaffType.SUPERADMIN;

  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlantTasks();
  }, [user]);

  const fetchPlantTasks = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) {
        response = user?.parkId ? await getPlantTasksByParkId(user.parkId) : await getAllPlantTasks();
      } else {
        response = await getAllAssignedPlantTasks(user?.id || '');
      }
      setPlantTasks(response.data);

      // Sort tasks by position before setting the state
      const sortedTasks = response.data.sort((a, b) => a.position - b.position);

      // set filtered tables
      setOpen(sortedTasks.filter((task) => task.taskStatus === 'OPEN'));
      setInProgress(sortedTasks.filter((task) => task.taskStatus === 'IN_PROGRESS'));
      setCompleted(sortedTasks.filter((task) => task.taskStatus === 'COMPLETED'));
      setCancelled(sortedTasks.filter((task) => task.taskStatus === 'CANCELLED'));

      // Fetch staff list
      let staffResponse;
      if (user?.role === StaffType.SUPERADMIN) {
        staffResponse = await getAllStaffs();
      } else if (user?.parkId) {
        staffResponse = await getAllStaffsByParkId(user.parkId);
      }

      const filteredStaff = staffResponse?.data.filter((staff) => staff.role === StaffType.ARBORIST || staff.role === StaffType.BOTANIST);
      setStaffList(filteredStaff || []);
    } catch (error) {
      console.error('Error fetching plant tasks:', error);
      messageApi.error('Failed to fetch plant tasks');
    } finally {
      setLoading(false);
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
      <Collapse className="mb-4 bg-white">
        <Panel header="Task Dashboard" key="1">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <PlantTaskDashboard plantTasks={plantTasks} />
            </TabPane>
            <TabPane tab="Staff Workload" key="2">
              <StaffWorkloadTable
                staffList={staffList}
                plantTasks={plantTasks}
                isSuperAdmin={isSuperAdmin}
                selectedParkId={selectedParkId}
                onParkChange={(parkId) => setSelectedParkId(parkId)}
              />
            </TabPane>
            <TabPane tab="Chart 2" key="3">
              {/* Add your second chart component here */}
              <div>Chart 2 Content</div>
            </TabPane>
          </Tabs>
        </Panel>
      </Collapse>
    );
  };

  const totalOpenTasks = plantTasks.filter((task) => task.taskStatus === 'OPEN').length;
  const outstandingTasks = plantTasks.filter((task) => task.taskStatus !== 'COMPLETED' && task.taskStatus !== 'CANCELLED').length;
  const urgentTasks = plantTasks.filter(
    (task) =>
      (task.taskUrgency === 'HIGH' || task.taskUrgency === 'IMMEDIATE') &&
      task.taskStatus !== 'COMPLETED' &&
      task.taskStatus !== 'CANCELLED',
  ).length;
  const overdueTasks = plantTasks.filter(
    (task) => moment(task.dueDate).isBefore(moment()) && task.taskStatus !== 'COMPLETED' && task.taskStatus !== 'CANCELLED',
  ).length;

  const renderStatisticsOverview = () => {
    return (
      <Card title="Task Statistics (Unresolved)" className="mb-4 bg-white">
        <Row gutter={16} className="mb-4" justify="center" align="middle">
          <Col span={6} style={{ textAlign: 'center' }}>
            <Statistic title="Open Tasks" value={totalOpenTasks} />
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Statistic title="Task In Progress" value={inProgress.length} />
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Statistic title="Urgent Tasks" value={urgentTasks} suffix={`of ${outstandingTasks}`} />
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Statistic title="Overdue Tasks" value={overdueTasks} suffix={`of ${outstandingTasks}`} />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderTableView = () => {
    return (
      <Card>
        <PlantTaskTableView
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

  const renderViewSelector = () => {
    if (isSuperAdmin) {
      return null;
    }
    return (
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
    );
  };

  const renderBoard = () => {
    if (isSuperAdmin || viewMode === 'table') {
      return renderTableView();
    } else {
      return (
        <PlantTaskBoardView
          open={open}
          inProgress={inProgress}
          completed={completed}
          cancelled={cancelled}
          setOpen={setOpen}
          setCompleted={setCompleted}
          setInProgress={setInProgress}
          setCancelled={setCancelled}
          refreshData={fetchPlantTasks}
          userRole={user?.role || ''}
        />
      );
    }
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      {renderStatisticsOverview()}
      {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && renderDashboardOverview()}
      <Flex justify="space-between" align="center" className="mb-4">
        <Flex align="center">
          {renderViewSelector()}
          {(isSuperAdmin || viewMode === 'table') && (
            <Select value={tableViewType} onChange={setTableViewType} style={{ width: 200, marginLeft: 16 }}>
              <Select.Option value="all">All Tasks</Select.Option>
              <Select.Option value="grouped-status">Grouped by Status</Select.Option>
              <Select.Option value="grouped-urgency">Grouped by Urgency</Select.Option>
            </Select>
          )}
        </Flex>
        <Flex gap={10}>
          {(isSuperAdmin || viewMode === 'table') && (
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
      {renderBoard()}
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
