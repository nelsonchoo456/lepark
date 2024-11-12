import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Badge, Button, Card, Col, Empty, List, Row, Spin, Statistic, Table, Tag, Tooltip, Typography } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useMemo, useState } from 'react';
import PageHeader2 from '../../../components/main/PageHeader2';
import styled from 'styled-components';
import { TeamOutlined } from '@ant-design/icons';
import { useFetchAnnouncements } from '../../../hooks/Announcements/useFetchAnnouncements';
import {
  AnnouncementResponse,
  getAllAssignedPlantTasks,
  getAllParks,
  getAllPlantTasks,
  getAnnouncementsByParkId,
  getMaintenanceTasksByParkId,
  getPlantTasksByParkId,
  MaintenanceTaskResponse,
  MaintenanceTaskStatusEnum,
  ParkResponse,
  PlantTaskResponse,
  PlantTaskStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { MdCheck, MdOutlineAnnouncement } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import PlantTasksTable from '../components/PlantTasksTable';
import moment from 'moment';
import AnnouncementsCard from '../components/AnnouncementsCard';
import { useNavigate } from 'react-router-dom';
import { useCrowdCounts } from '../../../hooks/CrowdInsights/useCrowdCounts';
import { CrowdAlert, useCrowdAlerts } from '../../../hooks/CrowdInsights/useCrowdAlerts';
import dayjs from 'dayjs';
import { LiveVisitorCard } from '../components/LiveVisitorCard';
import { WeeklyVisitorCard } from '../components/WeeklyVisitorCard';
import { CrowdAlertsCard } from '../components/CrowdAlertsCard';

export const flexColsStyles = 'flex flex-col md:flex-row md:justify-between gap-4';
export const sectionStyles = 'pr-4';
export const sectionHeaderIconStyles = 'text-lg h-7 w-7 rounded-full flex items-center justify-center mr-2';
export const sectionHeader = 'flex cursor-pointer w-full hover:underline hover:text-green-400';

export const renderSectionHeader = (title: string, onClick?: () => void) => {
  return (
    <div className="sticky top-0 pt-4 z-20 bg-gray-100">
      <LogoText className={`text-lg font-semibold pb-2 pt-0 ${onClick && 'cursor-pointer hover:opacity-80'}`} onClick={onClick && onClick}>
        <div className={`-z-10  px-2 rounded`}>{title}</div>
      </LogoText>
      <div className="w-full h-[1px] bg-gray-400/40 mb-4" />
    </div>
  );
};

const ManagerMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const { total, parks: parkCrowds, loading } = useCrowdCounts(user?.parkId);
  const [crowdAlerts, setCrowdAlerts] = useState<CrowdAlert[]>([]);

  // Data
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTaskResponse[]>([]);

  useEffect(() => {
    if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
      fetchPlantTasks();
      fetchMaintenanceTasks();
      fetchParks();
    }
  }, [user]);

  const fetchAnnouncementsByParkId = async (parkId: number) => {
    try {
      const response = await getAnnouncementsByParkId(parkId);
      const filteredAnnouncements = response.data.filter((announcement) => announcement.status === 'ACTIVE');
      setAnnouncements(filteredAnnouncements);
      // setError(null);
    } catch (err) {
      // setError('Failed to fetch announcements');
    }
  };

  const fetchParks = async () => {
    try {
      const response = await getAllParks();
      if (response.status === 200) {
        setParks(response.data);
      }
    } catch (error) {
      console.error('Error fetching parks:', error);
    }
  };

  const { alerts, isLoading: alertsLoading } = useCrowdAlerts({
    parkId: user?.parkId,
    parks, // Use the full park data
    days: 7,
  });

  const fetchPlantTasks = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) {
        response = user?.parkId ? await getPlantTasksByParkId(user.parkId) : await getAllPlantTasks();
      } else {
        response = await getAllAssignedPlantTasks(user?.id || '');
      }
      setPlantTasks(response.data);
    } catch (error) {
      console.error('Error fetching plant tasks:', error);
    }
  };

  const fetchMaintenanceTasks = async () => {
    try {
      if (!user) return;
      let response;
      if (user?.role === StaffType.MANAGER && user.parkId) {
        response = await getMaintenanceTasksByParkId(user.parkId);
        setMaintenanceTasks(response.data);
      }
      // setPlantTasks(response.data);
    } catch (error) {
      console.error('Error fetching plant tasks:', error);
    }
  };

  const pendingTasksCount = useMemo(() => {
    return plantTasks
      ? plantTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
          .length
      : 0;
  }, [plantTasks]);

  const overduePlantTasksCount = useMemo(() => {
    return plantTasks
      ? plantTasks.filter(
          (task) =>
            task.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
            task.taskStatus !== PlantTaskStatusEnum.CANCELLED &&
            moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')),
        ).length
      : 0;
  }, [plantTasks]);

  const pendingMaintenanceCount = useMemo(() => {
    return maintenanceTasks
      ? maintenanceTasks.filter(
          (m) => m.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS || m.taskStatus === MaintenanceTaskStatusEnum.OPEN,
        ).length
      : 0;
  }, [maintenanceTasks]);

  const overdueMaintenanceCount = useMemo(() => {
    return maintenanceTasks
      ? maintenanceTasks.filter(
          (m) =>
            (m.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS || m.taskStatus === MaintenanceTaskStatusEnum.OPEN) &&
            moment().startOf('day').isAfter(moment(m.dueDate).startOf('day')),
        ).length
      : 0;
  }, [maintenanceTasks]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    stroke: {
      curve: 'smooth', // Smooth curve for the line
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Days of the week
      title: {
        text: 'Day of the Week',
      },
    },
    yaxis: {
      title: {
        text: 'Visitor Count',
      },
    },
    title: {
      text: 'Visitor Count the Past Week',
      align: 'center',
    },
    dataLabels: {
      enabled: false, // Disable data labels to keep chart clean
    },
    fill: {
      type: 'gradient', // Enable gradient fill
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
      },
    },
    colors: ['#34a853'], // Color of the line
  };

  const chartSeries = [
    {
      name: 'Visitors',
      data: [0, 0, 0, 0, 0, 0, 0], // Sample daily visitor counts
    },
  ];

  return (
    <Row>
      <Col span={21}>
        {/* -- [ Section: Park Overview ] -- */}
        <div id="part-1" className={sectionStyles}>
          {renderSectionHeader('Park Overview')}
          <div className={flexColsStyles}>
            {/* Tasks Cards  */}
            <div className="w-full h-86 flex-[2] flex flex-col gap-4">
              <Card className="h-full" styles={{ body: { padding: '1rem' } }}>
                <div className={sectionHeader} onClick={() => navigate('/plant-tasks')}>
                  <div className={`${sectionHeaderIconStyles} bg-highlightGreen-400 text-white`}>
                    <FiInbox />
                  </div>
                  <LogoText className="text-lg mb-2">Plant Tasks</LogoText>
                </div>
                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {pendingTasksCount > 0 ? (
                    <div className="text-mustard-400 font-semibold mr-2">{pendingTasksCount} Pending Tasks</div>
                  ) : (
                    <div className="text-mustard-400 gap-3 flex items-center">
                      <MdCheck className="text-lg" /> No Pending Tasks
                    </div>
                  )}

                  {overduePlantTasksCount > 0 ? (
                    <div className="text-red-400 font-semibold mr-2">{overduePlantTasksCount} Overdue Tasks</div>
                  ) : (
                    <div className="text-red-400 gap-3 flex items-center">
                      <MdCheck className="text-lg" /> No Overdue Tasks
                    </div>
                  )}
                </div>
              </Card>
              <Card className="h-full" styles={{ body: { padding: '1rem' } }}>
                <div className={sectionHeader}>
                  <div className={`${sectionHeaderIconStyles} bg-sky-400 text-white`}>
                    <FiInbox />
                  </div>
                  <LogoText className="text-lg mb-2">Maintenance Tasks</LogoText>
                </div>
                <div className="flex justify-center items-center h-full opacity-50">No data</div>
              </Card>
            </div>

            <AnnouncementsCard announcements={announcements} />
          </div>
        </div>

        {/* -- [ Section: Park Overview ] -- */}
        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Plant Tasks', () => navigate('plant-tasks'))}
          {user && <PlantTasksTable userRole={user?.role as StaffType} plantTasks={plantTasks} className="w-full" />}
        </div>

        <div id="part-3" className={sectionStyles}>
          {renderSectionHeader('Maintenance Tasks')}
          <Empty description="Maintenance Tasks coming soon..." className="md:py-8" />
        </div>

        {/* -- [ Section: Visitors Resource ] -- */}
        <div id="part-4" className={sectionStyles}>
          {renderSectionHeader('Visitors')}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col flex-[2] gap-4">
              <LiveVisitorCard loading={loading} parkData={parkCrowds[0]} />
              <WeeklyVisitorCard loading={loading} parkData={parkCrowds[0]} />
            </div>
            <div className="flex-[1]">
              <CrowdAlertsCard alerts={alerts} loading={alertsLoading} />
            </div>
          </div>
        </div>
      </Col>
      <Col span={3}>
        <Anchor
          offsetTop={90}
          items={[
            {
              key: 'part-1',
              href: '#part-1',
              title: 'Park Overview',
            },
            {
              key: 'part-2',
              href: '#part-2',
              title: 'Plant Tasks',
            },
            {
              key: 'part-3',
              href: '#part-3',
              title: 'Maintenance Tasks',
            },
            {
              key: 'part-4',
              href: '#part-4',
              title: 'Visitors',
            },
          ]}
        />
      </Col>
    </Row>
  );
};

export default ManagerMainLanding;
