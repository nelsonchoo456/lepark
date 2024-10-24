import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Flex, message, Radio, Select, Collapse, Row, Col, Statistic } from 'antd';
import { FiSearch } from 'react-icons/fi';
import { useEffect, useState, useMemo } from 'react';
import {
  getAllMaintenanceTasks,
  getMaintenanceTasksByParkId,
  MaintenanceTaskResponse,
  StaffType,
  StaffResponse,
  deleteMaintenanceTask,
  assignMaintenanceTask,
  getAllStaffsByParkId,
  getAllStaffs,
  getAllAssignedMaintenanceTasks,
  unassignMaintenanceTask,
  MaintenanceTaskStatusEnum,
  getParkAverageTaskCompletionTime,
  getParkTaskLoadPercentage,
  CompletionRateData,
  OverdueRateMaintenanceTaskData,
  AverageCompletionTimeData,
  TaskLoadPercentageData,
  getStaffPerformanceRanking,
  StaffPerformanceRankingData,
  getMaintenanceTasksBySubmittingStaff,
} from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import ConfirmDeleteModal from '../../components/modal/ConfirmDeleteModal';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import moment from 'moment';
import { Tabs } from 'antd';
import { MdArrowBack } from 'react-icons/md';
import MaintenanceTaskBoardView from './MaintenanceTaskBoardView';
import MaintenanceTaskTableView from './MaintenanceTaskTableView';

const { Panel } = Collapse;
const { TabPane } = Tabs;

const MaintenanceTaskList: React.FC = () => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [maintenanceTaskToBeDeleted, setMaintenanceTaskToBeDeleted] = useState<MaintenanceTaskResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewMode, setViewMode] = useState<'categories' | 'table'>('categories');
  const [inDashboards, setInDashboards] = useState(false);
  const [tableViewType, setTableViewType] = useState<'all' | 'grouped-status' | 'grouped-urgency'>('all');

  const [open, setOpen] = useState<MaintenanceTaskResponse[]>([]);
  const [inProgress, setInProgress] = useState<MaintenanceTaskResponse[]>([]);
  const [completed, setCompleted] = useState<MaintenanceTaskResponse[]>([]);
  const [cancelled, setCancelled] = useState<MaintenanceTaskResponse[]>([]);

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
      user?.role === StaffType.MANAGER ||
      user?.role === StaffType.ARBORIST ||
      user?.role === StaffType.BOTANIST ||
      user?.role === StaffType.LANDSCAPE_ARCHITECT ||
      user?.role === StaffType.PARK_RANGER
    );
  }, [user?.role]);

  useEffect(() => {
    fetchMaintenanceTasks();
    if (user?.role === StaffType.MANAGER) {
      fetchStaffPerformanceRanking();
    }
  }, [user]);

  const fetchMaintenanceTasks = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.VENDOR_MANAGER) {
        response = user?.parkId ? await getMaintenanceTasksByParkId(user.parkId) : await getAllMaintenanceTasks();
      } else {
        response = await getMaintenanceTasksBySubmittingStaff(user?.id || '');
      }
      setMaintenanceTasks(response.data);

      // Sort tasks by position before setting the state
      const sortedTasks = response.data.sort((a, b) => a.position - b.position);

      // set filtered tables
      if (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) {
        // For superadmin and manager, show all tasks in each category
        setOpen(sortedTasks.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.OPEN));
        setInProgress(sortedTasks.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS));
        setCompleted(sortedTasks.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.COMPLETED));
        setCancelled(sortedTasks.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.CANCELLED));
      } else {
        // For other roles, keep the existing filters
        setOpen(sortedTasks.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.OPEN));
        setInProgress(
          sortedTasks.filter((task) => task.assignedStaffId === user?.id && task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS),
        );
        setCompleted(
          sortedTasks.filter((task) => task.assignedStaffId === user?.id && task.taskStatus === MaintenanceTaskStatusEnum.COMPLETED),
        );
        setCancelled(sortedTasks.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.CANCELLED));
      }

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
      console.error('Error fetching maintenance tasks:', error);
      messageApi.error('Failed to fetch maintenance tasks');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaintenanceTasks = useMemo(() => {
    return maintenanceTasks.filter((maintenanceTask) =>
      Object.values(maintenanceTask).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, maintenanceTasks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (maintenanceTaskId: string) => {
    navigate(`/maintenance-tasks/${maintenanceTaskId}`);
  };

  const showDeleteModal = (maintenanceTask: MaintenanceTaskResponse) => {
    setDeleteModalOpen(true);
    setMaintenanceTaskToBeDeleted(maintenanceTask);
  };

  const cancelDelete = () => {
    setMaintenanceTaskToBeDeleted(null);
    setDeleteModalOpen(false);
  };

  const deleteMaintenanceTaskConfirmed = async () => {
    try {
      if (!maintenanceTaskToBeDeleted) {
        throw new Error('Unable to delete Maintenance Task at this time');
      }
      await deleteMaintenanceTask(maintenanceTaskToBeDeleted.id);
      fetchMaintenanceTasks();
      setMaintenanceTaskToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.success(`Deleted Maintenance Task: ${maintenanceTaskToBeDeleted.title}.`);
    } catch (error) {
      console.error(error);
      setMaintenanceTaskToBeDeleted(null);
      setDeleteModalOpen(false);
      messageApi.error('Unable to delete Maintenance Task at this time. Please try again later.');
    }
  };

  const breadcrumbItems = [
    {
      title: 'Maintenance Task Management',
      pathKey: '/maintenance-tasks',
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

  //   const renderDashboardOverview = () => {
  //     return (
  //       <>
  //         {renderStatisticsOverview(true)}
  //         <Card styles={{ body: { padding: 0 } }} className="px-4 pb-4 pt-2 mb-4">
  //           <Tabs
  //             defaultActiveKey="1"
  //             items={[
  //               {
  //                 key: '1',
  //                 label: 'Pending Tasks Breakdown',
  //                 children: (
  //                   <MaintenanceTaskDashboard
  //                     maintenanceTasks={maintenanceTasks}
  //                     isSuperAdmin={isSuperAdmin}
  //                     selectedParkId={selectedParkId}
  //                     onParkChange={(parkId) => setSelectedParkId(parkId)}
  //                     parkOptions={parkOptions as { value: string | null; label: string }[]}
  //                   />
  //                 ),
  //               },
  //               {
  //                 key: '2',
  //                 label: 'Staff Workload',
  //                 children: (
  //                   <>
  //                     <StaffWorkloadTable
  //                       staffList={staffList}
  //                       maintenanceTasks={maintenanceTasks}
  //                       isSuperAdmin={isSuperAdmin}
  //                       selectedParkId={selectedParkId}
  //                       onParkChange={(parkId) => setSelectedParkId(parkId)}
  //                       parkOptions={parkOptions as { value: string | null; label: string }[]}
  //                     />
  //                     <TaskLoadPercentageChart />
  //                   </>
  //                 ),
  //               },
  //               !isSuperAdmin
  //                 ? {
  //                     key: '3',
  //                     label: 'Staff Performance Analytics',
  //                     children: (
  //                       <>
  //                         {staffPerformanceRanking && (
  //                           <StaffPerformanceRanking
  //                             bestPerformer={staffPerformanceRanking.bestPerformer}
  //                             secondBestPerformer={staffPerformanceRanking.secondBestPerformer}
  //                             thirdBestPerformer={staffPerformanceRanking.thirdBestPerformer}
  //                             message={staffPerformanceRanking.message}
  //                           />
  //                         )}
  //                         <Row gutter={[16, 16]}>
  //                           <Col span={12}>
  //                             <CompletionRateChart />
  //                           </Col>
  //                           <Col span={12}>
  //                           <StaffCompletionRatesLineChart />

  //                           </Col>
  //                         </Row>
  //                         <Row gutter={[16, 16]} className="mt-4">
  //                           <Col span={12}>
  //                             <AverageCompletionTimeChart />
  //                           </Col>
  //                           <Col span={12}>
  //                             <StaffAverageCompletionTimeLineChart />
  //                           </Col>
  //                         </Row>
  //                         <Row gutter={[16, 16]} className="mt-4">
  //                           <Col span={12}>
  //                             <TaskCompletedChart />
  //                           </Col>
  //                           <Col span={12}>
  //                             <StaffTasksCompletedLineChart />
  //                           </Col>
  //                         </Row>
  //                         <Row gutter={[16, 16]} className="mt-4">
  //                           <Col span={12}>
  //                           <OverdueRateChart />
  //                           </Col>
  //                           <Col span={12}>
  //                             <StaffOverdueRatesLineChart />
  //                           </Col>
  //                         </Row>
  //                       </>
  //                     ),
  //                   }
  //                 : null,
  //             ].filter(Boolean)}
  //           />
  //         </Card>
  //       </>
  //     );
  //   };

  const handleTakeTask = async (maintenanceTaskId: string, staffId: string) => {
    try {
      await assignMaintenanceTask(maintenanceTaskId, staffId);
      messageApi.success('Staff assigned successfully');
      fetchMaintenanceTasks();
    } catch (error) {
      console.error('Error assigning staff:', error);
      messageApi.error('Failed to assign staff');
    }
  };

  const handleReturnTask = async (maintenanceTaskId: string, staffId: string) => {
    try {
      await unassignMaintenanceTask(maintenanceTaskId, staffId);
      message.success('Staff unassigned successfully');
      fetchMaintenanceTasks();
    } catch (error) {
      console.error('Failed to unassign staff:', error);
      message.error('Failed to unassign staff');
    }
  };

  const totalOpenTasks = maintenanceTasks.filter((task) => task.taskStatus === 'OPEN').length;
  const outstandingTasks = maintenanceTasks.filter((task) => task.taskStatus !== 'COMPLETED' && task.taskStatus !== 'CANCELLED').length;
  const urgentTasks = maintenanceTasks.filter(
    (task) =>
      (task.taskUrgency === 'HIGH' || task.taskUrgency === 'IMMEDIATE') &&
      task.taskStatus !== 'COMPLETED' &&
      task.taskStatus !== 'CANCELLED',
  ).length;
  const overdueTasks = maintenanceTasks.filter(
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
      </>
    );
  };

  const renderTableView = () => {
    return (
      <MaintenanceTaskTableView
        maintenanceTasks={filteredMaintenanceTasks}
        loading={loading}
        staffList={staffList}
        tableViewType={tableViewType}
        userRole={user?.role || ''}
        handleTakeTask={handleTakeTask}
        handleReturnTask={handleReturnTask}
        navigateToDetails={navigateToDetails}
        navigate={navigate}
        showDeleteModal={showDeleteModal}
        onTaskUpdated={fetchMaintenanceTasks}
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
        <MaintenanceTaskBoardView
          open={open}
          inProgress={inProgress}
          completed={completed}
          cancelled={cancelled}
          setOpen={setOpen}
          setCompleted={setCompleted}
          setInProgress={setInProgress}
          setCancelled={setCancelled}
          refreshData={fetchMaintenanceTasks}
          userRole={user?.role || ''}
          loading={loading}
        />
      );
    }
  };

  const handleStatusChange = (newStatus: MaintenanceTaskStatusEnum) => {
    fetchMaintenanceTasks();
  };

  //   if (inDashboards) {
  //     return (
  //       <ContentWrapperDark>
  //         {contextHolder}
  //         <PageHeader2 breadcrumbItems={breadcrumbItems} />
  //         {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && renderDashboardOverview()}
  //       </ContentWrapperDark>
  //     );
  //   }

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
              placeholder="Search in Maintenance Tasks..."
              className="bg-white"
              variant="filled"
              onChange={handleSearch}
            />
          )}
          <Button
            type="primary"
            onClick={() => {
              navigate('/maintenance-tasks/create');
            }}
          >
            Create Maintenance Task
          </Button>
        </Flex>
      </Flex>
      {renderBoard()}
      <ConfirmDeleteModal
        onConfirm={deleteMaintenanceTaskConfirmed}
        open={deleteModalOpen}
        onCancel={cancelDelete}
        description="Are you sure you want to delete this Maintenance Task?"
      />
    </ContentWrapperDark>
  );
};

export default MaintenanceTaskList;
