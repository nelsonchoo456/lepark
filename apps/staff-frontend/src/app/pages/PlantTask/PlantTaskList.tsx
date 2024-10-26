import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
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
  unassignPlantTask,
  PlantTaskStatusEnum,
  getStaffPerformanceRanking,
  StaffPerformanceRankingData,
  getPlantTasksBySubmittingStaff,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import PlantTaskBoardView from './PlantTaskBoardView';
import PlantTaskDashboard from './PlantTaskDashboard/PlantTaskDashboard';
import PlantTaskTableView from './PlantTaskTableView';
import moment from 'moment';
import { Tabs } from 'antd';
import { MdArrowBack } from 'react-icons/md';
import StaffWorkloadTable from './PlantTaskDashboard/components/StaffWorkloadTable';
import CompletionRateChart from './PlantTaskDashboard/components/CompletionRateChart';
import OverdueRateChart from './PlantTaskDashboard/components/OverdueRateChart';
import AverageCompletionTimeChart from './PlantTaskDashboard/components/AverageCompletionTimeChart';
import TaskLoadPercentageChart from './PlantTaskDashboard/components/TaskLoadPercentageChart';
import StaffPerformanceRanking from './PlantTaskDashboard/components/StaffPerformanceRanking';
import StaffAverageCompletionTimeLineChart from './PlantTaskDashboard/components/StaffAverageCompletionTimeLineChart';
import TaskCompletedChart from './PlantTaskDashboard/components/TaskCompletedChart';
import StaffCompletionRatesLineChart from './PlantTaskDashboard/components/StaffCompletionRatesLineChart';
import StaffOverdueRatesLineChart from './PlantTaskDashboard/components/StaffOverdueRatesLineChart';
import StaffTasksCompletedLineChart from './PlantTaskDashboard/components/StaffTasksCompletedLineChart';

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
  const [inDashboards, setInDashboards] = useState(false);
  const [tableViewType, setTableViewType] = useState<'all' | 'grouped-status' | 'grouped-urgency'>('all');

  const [open, setOpen] = useState<PlantTaskResponse[]>([]);
  const [inProgress, setInProgress] = useState<PlantTaskResponse[]>([]);
  const [completed, setCompleted] = useState<PlantTaskResponse[]>([]);
  const [cancelled, setCancelled] = useState<PlantTaskResponse[]>([]);

  const [staffList, setStaffList] = useState<StaffResponse[]>([]);

  const isSuperAdmin = user?.role === StaffType.SUPERADMIN;

  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);

  const parkOptions = useMemo(() => {
    const uniqueParks = Array.from(new Set(staffList.map((staff) => staff.park?.name)));
    return [{ value: null, label: 'All Parks' }, ...uniqueParks.map((parkName) => ({ value: parkName, label: parkName }))];
  }, [staffList]);

  const [staffPerformanceRanking, setStaffPerformanceRanking] = useState<StaffPerformanceRankingData | null>(null);

  const isTableOnlyView = useMemo(() => {
    return (
      user?.role === StaffType.SUPERADMIN ||
      user?.role === StaffType.LANDSCAPE_ARCHITECT ||
      user?.role === StaffType.PARK_RANGER ||
      user?.role === StaffType.VENDOR_MANAGER
    );
  }, [user?.role]);

  useEffect(() => {
    fetchPlantTasks();
    if (user?.role === StaffType.MANAGER) {
      fetchStaffPerformanceRanking();
    }
  }, [user]);

  const fetchPlantTasks = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) {
        response = user?.parkId ? await getPlantTasksByParkId(user.parkId) : await getAllPlantTasks();
      } else if (user?.role === StaffType.ARBORIST || user?.role === StaffType.BOTANIST) {
        response = await getAllAssignedPlantTasks(user?.id || '');
      } else {
        // For LANDSCAPE_ARCHITECT, PARK_RANGER, VENDOR_MANAGER
        response = await getPlantTasksBySubmittingStaff(user?.id || '');
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

  const handleUnassignStaff = async (plantTaskId: string, staffId: string) => {
    try {
      await unassignPlantTask(plantTaskId, staffId);
      messageApi.success('Staff unassigned successfully');
      fetchPlantTasks();
    } catch (error) {
      console.error('Failed to unassign staff:', error);
      messageApi.error('Failed to unassign staff');
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

  const fetchStaffPerformanceRanking = async () => {
    try {
      const startOfMonth = moment().startOf('month').toDate();
      const endOfMonth = moment().endOf('month').toDate();
      const response = await getStaffPerformanceRanking(user?.parkId || null, startOfMonth, endOfMonth);
      setStaffPerformanceRanking(response.data);
    } catch (error) {
      console.error('Error fetching staff performance ranking:', error);
      messageApi.error('Failed to fetch staff performance ranking');
    }
  };

  const renderDashboardOverview = () => {
    return (
      <>
        {renderStatisticsOverview(true)}
        <Card styles={{ body: { padding: 0 } }} className="px-4 pb-4 pt-2 mb-4">
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Pending Tasks Breakdown',
                children: (
                  <PlantTaskDashboard
                    plantTasks={plantTasks}
                    isSuperAdmin={isSuperAdmin}
                    selectedParkId={selectedParkId}
                    onParkChange={(parkId) => setSelectedParkId(parkId)}
                    parkOptions={parkOptions as { value: string | null; label: string }[]}
                  />
                ),
              },
              {
                key: '2',
                label: 'Staff Workload',
                children: (
                  <>
                    <StaffWorkloadTable
                      staffList={staffList}
                      plantTasks={plantTasks}
                      isSuperAdmin={isSuperAdmin}
                      selectedParkId={selectedParkId}
                      onParkChange={(parkId) => setSelectedParkId(parkId)}
                      parkOptions={parkOptions as { value: string | null; label: string }[]}
                    />
                    {user?.role === StaffType.MANAGER && <TaskLoadPercentageChart />}
                  </>
                ),
              },
              !isSuperAdmin
                ? {
                    key: '3',
                    label: 'Staff Performance Analytics',
                    children: (
                      <>
                        {staffPerformanceRanking && (
                          <StaffPerformanceRanking
                            bestPerformer={staffPerformanceRanking.bestPerformer}
                            secondBestPerformer={staffPerformanceRanking.secondBestPerformer}
                            thirdBestPerformer={staffPerformanceRanking.thirdBestPerformer}
                            message={staffPerformanceRanking.message}
                          />
                        )}
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <CompletionRateChart />
                          </Col>
                          <Col span={12}>
                            <StaffCompletionRatesLineChart />
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]} className="mt-4">
                          <Col span={12}>
                            <AverageCompletionTimeChart />
                          </Col>
                          <Col span={12}>
                            <StaffAverageCompletionTimeLineChart />
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]} className="mt-4">
                          <Col span={12}>
                            <TaskCompletedChart />
                          </Col>
                          <Col span={12}>
                            <StaffTasksCompletedLineChart />
                          </Col>
                        </Row>
                        <Row gutter={[16, 16]} className="mt-4">
                          <Col span={12}>
                            <OverdueRateChart />
                          </Col>
                          <Col span={12}>
                            <StaffOverdueRatesLineChart />
                          </Col>
                        </Row>
                      </>
                    ),
                  }
                : null,
            ].filter(Boolean)}
          />
        </Card>
      </>
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
    (task) =>
      moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')) &&
      task.taskStatus !== 'COMPLETED' &&
      task.taskStatus !== 'CANCELLED',
  ).length;

  const renderStatisticsOverview = (defaultOpen?: boolean) => {
    return (
      <>
        {inDashboards && (
          <div className="flex items-center">
            <Button className="text-wrap mb-2" icon={<MdArrowBack />} type="link" onClick={() => setInDashboards(false)}>
              Return
            </Button>
          </div>
        )}
        {user?.role !== StaffType.LANDSCAPE_ARCHITECT &&
          user?.role !== StaffType.PARK_RANGER &&
          user?.role !== StaffType.VENDOR_MANAGER && (
            <Collapse
              defaultActiveKey={defaultOpen ? ['1'] : []}
              className="mb-4 bg-white"
              bordered={false}
              expandIconPosition="end"
              items={[
                {
                  key: '1',
                  label: <LogoText className="">Task Overview</LogoText>,
                  children: (
                    <Flex>
                      <Flex justify="space-evenly" className="w-full">
                        <Col style={{ textAlign: 'center' }}>
                          <Statistic title="Open Tasks" value={totalOpenTasks} />
                        </Col>
                        <Col style={{ textAlign: 'center' }}>
                          <Statistic title="Task In Progress" value={inProgress.length} />
                        </Col>
                        <Col style={{ textAlign: 'center' }}>
                          <Statistic title="Urgent Tasks" value={urgentTasks} suffix={`of ${outstandingTasks}`} />
                        </Col>
                        <Col style={{ textAlign: 'center' }}>
                          <Statistic title="Overdue Tasks" value={overdueTasks} suffix={`of ${outstandingTasks}`} />
                        </Col>
                      </Flex>
                      {!inDashboards && (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
                        <div className="flex items-center">
                          <Button type="link" onClick={() => setInDashboards(true)}>
                            View more
                          </Button>
                        </div>
                      )}
                    </Flex>
                  ),
                },
              ]}
            />
          )}
      </>
    );
  };

  const renderTableView = () => {
    return (
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
        handleUnassignStaff={handleUnassignStaff}
        onTaskUpdated={fetchPlantTasks}
        handleStatusChange={handleStatusChange}
      />
    );
  };

  const renderViewSelector = () => {
    if (isTableOnlyView) {
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
        className="mr-4"
      >
        <Radio.Button value="categories">Board View</Radio.Button>
        <Radio.Button value="table">Table View</Radio.Button>
      </Radio.Group>
    );
  };

  const renderBoard = () => {
    if (isTableOnlyView || viewMode === 'table') {
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
          loading={loading}
        />
      );
    }
  };

  const handleStatusChange = (newStatus: PlantTaskStatusEnum) => {
    fetchPlantTasks();
  };

  if (inDashboards) {
    return (
      <ContentWrapperDark>
        {contextHolder}
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && renderDashboardOverview()}
      </ContentWrapperDark>
    );
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      {renderStatisticsOverview()}
      <Flex justify="space-between" align="center" className="mb-4">
        <Flex align="center">
          {renderViewSelector()}
          {(isTableOnlyView || viewMode === 'table') && (
            <Select
              value={tableViewType}
              onChange={setTableViewType}
              style={{ width: 200, backgroundColor: 'white', borderRadius: '0.35rem' }}
              variant="borderless"
            >
              <Select.Option value="all">All Tasks</Select.Option>
              <Select.Option value="grouped-status">Grouped by Status</Select.Option>
              <Select.Option value="grouped-urgency">Grouped by Urgency</Select.Option>
            </Select>
          )}
        </Flex>
        <Flex gap={10}>
          {(isTableOnlyView || viewMode === 'table') && (
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
