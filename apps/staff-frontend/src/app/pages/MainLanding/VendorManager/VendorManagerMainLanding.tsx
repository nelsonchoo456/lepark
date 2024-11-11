import { ContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Card, Col, Row } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useMemo, useState } from 'react';
import { MdCheck } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import {
  AnnouncementResponse,
  getAllAssignedMaintenanceTasks,
  getAllMaintenanceTasks,
  getAnnouncementsByParkId,
  getMaintenanceTasksByParkId,
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import MaintenanceTasksTable from '../../MainLanding/components/MaintenanceTasksTable';
import AnnouncementsCard from '../components/AnnouncementsCard';
import { renderSectionHeader, sectionHeader } from '../Manager/ManagerMainLanding';
import { flexColsStyles, sectionHeaderIconStyles, sectionStyles } from '../BotanistArborist/BAMainLanding';

const MaintenanceMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [desktop, setDesktop] = useState<boolean>(window.innerWidth >= SCREEN_LG);

  // State
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTaskResponse[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
      fetchMaintenanceTasks();
    }
  }, [user]);

  const fetchAnnouncementsByParkId = async (parkId: number) => {
    try {
      const response = await getAnnouncementsByParkId(parkId);
      const filteredAnnouncements = response.data.filter((announcement) => announcement.status === 'ACTIVE');
      setAnnouncements(filteredAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

    const fetchMaintenanceTasks = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllMaintenanceTasks();
      } else if (user?.parkId) {
        response = await getMaintenanceTasksByParkId(user.parkId);
        console.log('response', response.data);
      }
      setMaintenanceTasks(response?.data || []);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
    }
  };

  const myTasks = useMemo(() => {
    return maintenanceTasks;
  }, [maintenanceTasks]);

  const myPendingTasks = useMemo(() => {
    return myTasks
      ? myTasks?.filter((task) => task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS)
      : [];
  }, [myTasks]);

  const myOverdueTasks = useMemo(() => {
    return myTasks
      ? myTasks.filter(
          (task) =>
            task.taskStatus !== MaintenanceTaskStatusEnum.COMPLETED &&
            task.taskStatus !== MaintenanceTaskStatusEnum.CANCELLED &&
            moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')),
        )
      : [];
  }, [myTasks]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      title: {
        text: 'Day of the Week',
      },
    },
    yaxis: {
      title: {
        text: 'Tasks Completed',
      },
    },
    title: {
      text: 'Tasks Completed Past Week',
      align: 'center',
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
      },
    },
    colors: ['#34a853'],
  };

  const chartSeries = [
    {
      name: 'Completed Tasks',
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  return (
    <Row>
      <Col span={desktop ? 21 : 24}>
        {/* -- [ Section: Maintenance Overview ] -- */}
        <div id="part-1" className={sectionStyles}>
          {renderSectionHeader('Maintenance Overview')}
          <div className={flexColsStyles}>
            {/* Tasks Card */}
            <div className="w-full h-86 flex-[2] flex flex-col gap-4">
              <Card className="h-full" styles={{ body: { padding: '1rem' } }}>
                <div className={sectionHeader} onClick={() => navigate('maintenance-tasks')}>
                  <div className={`${sectionHeaderIconStyles} bg-highlightGreen-400 text-white`}>
                    <FaTools />
                  </div>
                  <LogoText className="text-lg mb-2">My Maintenance Tasks</LogoText>
                </div>

                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {myPendingTasks?.length > 0 ? (
                    <div className="text-mustard-400 font-semibold mr-2">
                      {myPendingTasks.length} Pending Tasks
                    </div>
                  ) : (
                    <div className="text-mustard-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> No Pending Tasks
                    </div>
                  )}

                  {myOverdueTasks.length > 0 ? (
                    <div className="text-red-400 font-semibold mr-2">
                      {myOverdueTasks.length} Overdue Tasks
                    </div>
                  ) : (
                    <div className="text-red-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> No Overdue Tasks
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Announcements Card */}
            <AnnouncementsCard announcements={announcements} />
          </div>
        </div>

        {/* -- [ Section: Maintenance Tasks ] -- */}
        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Maintenance Tasks', () => navigate('maintenance-tasks'))}
          {user && <MaintenanceTasksTable userRole={user?.role as StaffType} maintenanceTasks={myTasks} className="w-full" />}
        </div>

        {/* -- [ Section: Task Analytics ] -- */}
        <div id="part-3" className={sectionStyles}>
          {renderSectionHeader('Task Analytics')}
          <div className={flexColsStyles}>
            <Card className="w-full h-86 flex-[2]">
              <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
            </Card>
            <div className="flex flex-col flex-[1] gap-4">
              <Card className="w-full bg-green-100 flex-[1]" styles={{ body: { padding: '1rem' } }}>
                <LogoText className="">Weekly Completion Rate</LogoText>
                <div className="flex justify-center items-center h-full mt-2 opacity-50">No data</div>
              </Card>
              <Card className="w-full bg-green-100 flex-[1]" styles={{ body: { padding: '1rem' } }}>
                <LogoText className="">Average Response Time</LogoText>
                <div className="flex justify-center items-center h-full mt-2 opacity-50">No data</div>
              </Card>
            </div>
          </div>
        </div>
      </Col>

      {desktop && <Col span={3}>
        <Anchor
          offsetTop={90}
          items={[
            {
              key: 'part-1',
              href: '#part-1',
              title: 'Maintenance Overview',
            },
            {
              key: 'part-2',
              href: '#part-2',
              title: 'Maintenance Tasks',
            },
            {
              key: 'part-3',
              href: '#part-3',
              title: 'Task Analytics',
            },
          ]}
        />
      </Col>}
    </Row>
  );
};

export default MaintenanceMainLanding;
