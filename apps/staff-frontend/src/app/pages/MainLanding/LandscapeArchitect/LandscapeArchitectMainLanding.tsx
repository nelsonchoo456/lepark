import { ContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Card, Col, Row } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useMemo, useState } from 'react';
import { MdCheck, MdSensors } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import {
  AnnouncementResponse,
  getAllAssignedMaintenanceTasks,
  getAllMaintenanceTasks,
  getAllZones,
  getAnnouncementsByParkId,
  getMaintenanceTasksByParkId,
  getZonesByParkId,
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  StaffResponse,
  StaffType,
  ZoneResponse,
  ZoneStatusEnum,
} from '@lepark/data-access';
import MaintenanceTasksTable from '../../MainLanding/components/MaintenanceTasksTable';
import AnnouncementsCard from '../components/AnnouncementsCard';
import { renderSectionHeader, sectionHeader } from '../Manager/ManagerMainLanding';
import { flexColsStyles, sectionHeaderIconStyles, sectionStyles } from '../BotanistArborist/BAMainLanding';
import { TbTree, TbTrees } from 'react-icons/tb';
import { getSensorsByParkId, getHubsByParkId, SensorResponse, HubResponse, SensorStatusEnum, HubStatusEnum } from '@lepark/data-access';
import dayjs from 'dayjs';

export const isParkOpen = (park: ZoneResponse) => {
  const now = dayjs();
  const currentDay = now.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  const openingTime = dayjs(park.openingHours[currentDay]).format('HH:mm');
  let closingTime = dayjs(park.closingHours[currentDay]).format('HH:mm');
  if (closingTime === '00:00') {
    closingTime = '24:00';
  }

  const currentTime = now.format('HH:mm');

  // return now.isAfter(openingTime) && now.isBefore(closingTime);
  return currentTime >= openingTime && currentTime <= closingTime;
};

const LandscapeArchitect = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [desktop, setDesktop] = useState<boolean>(window.innerWidth >= SCREEN_LG);

  // State
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTaskResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);

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
      fetchZones();
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
      }
      setMaintenanceTasks(response?.data.filter((t) => t.facility !== null && t.facility !== undefined) || []);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
    }
  };

  const fetchZones = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllZones();
      } else if (user?.parkId) {
        response = await getZonesByParkId(user.parkId);
      }
      setZones(response?.data || []);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
    }
  };

  const openZones = useMemo(() => {
    return zones.filter((park) => {
      return (park.zoneStatus === ZoneStatusEnum.OPEN || park.zoneStatus === ZoneStatusEnum.LIMITED_ACCESS) && isParkOpen(park);
    });
  }, [zones]);

  const closedZones = useMemo(() => {
    return zones.filter((park) => {
      return park.zoneStatus === ZoneStatusEnum.CLOSED || !isParkOpen(park);
    });
  }, [zones]);

  const constructionZones = useMemo(() => {
    return zones.filter((park) => {
      return park.zoneStatus === ZoneStatusEnum.UNDER_CONSTRUCTION;
    });
  }, [zones]);


  const myTasks = useMemo(() => {
    return maintenanceTasks;
  }, [maintenanceTasks]);

  const myPendingTasks = useMemo(() => {
    return myTasks
      ? myTasks?.filter(
          (task) => task.taskStatus === MaintenanceTaskStatusEnum.OPEN || task.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS,
        )
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
                  <LogoText className="text-lg mb-2">Facility Maintenance Tasks</LogoText>
                </div>

                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {myPendingTasks?.length > 0 ? (
                    <div className="text-mustard-400 font-semibold mr-2">{myPendingTasks.length} Pending Tasks</div>
                  ) : (
                    <div className="text-mustard-400 gap-3 flex items-center">
                      <MdCheck className="text-lg" /> No Pending Tasks
                    </div>
                  )}

                  {myOverdueTasks.length > 0 ? (
                    <div className="text-red-400 font-semibold mr-2">{myOverdueTasks.length} Overdue Tasks</div>
                  ) : (
                    <div className="text-red-400 gap-3 flex items-center">
                      <MdCheck className="text-lg" /> No Overdue Tasks
                    </div>
                  )}
                </div>
              </Card>
              <div className="w-full flex-[2] flex flex-col gap-4">
                <Card className="flex flex-col h-full" styles={{ body: { padding: '1rem' } }}>
                  {/* Header Section */}
                  <div className="flex items-center mb-2">
                    <div className={`${sectionHeaderIconStyles} bg-green-400 text-white`}>
                      <TbTrees />
                    </div>
                    <LogoText className="text-lg">Zones</LogoText>
                  </div>

                  <div className="h-full flex w-full gap-2">
                    <div className="rounded-md bg-green-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-green-200">
                      <strong className="text-lg">{openZones.length}</strong>
                      <br />
                      Open Now
                    </div>
                    <div className="rounded-md bg-red-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-red-200">
                      <strong className="text-lg">{closedZones.length}</strong>
                      <br />
                      Closed Now
                    </div>
                    <div className="rounded-md bg-mustard-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-mustard-200">
                      <strong className="text-lg">{constructionZones.length}</strong>
                      <br />
                      Under Construction
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Announcements Card */}
            <AnnouncementsCard announcements={announcements} />
          </div>
        </div>

        {/* -- [ Section: Maintenance Tasks ] -- */}
        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Facility Maintenance Tasks', () => navigate('maintenance-tasks'))}
          {user && <MaintenanceTasksTable userRole={user?.role as StaffType} maintenanceTasks={myTasks} className="w-full" />}
        </div>

        
      </Col>

      {desktop && (
        <Col span={3}>
          <Anchor
            offsetTop={90}
            items={[
              {
                key: 'part-1',
                href: '#part-1',
                title: 'Overview',
              },
              {
                key: 'part-2',
                href: '#part-2',
                title: 'Tasks',
              },
            ]}
          />
        </Col>
      )}
    </Row>
  );
};

export default LandscapeArchitect;
