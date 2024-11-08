import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Badge, Card, Col, Empty, List, Row, Statistic, Table, Tag, Typography } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useMemo, useState } from 'react';
import PageHeader2 from '../../../components/main/PageHeader2';
import styled from 'styled-components';
import { useFetchAnnouncements } from '../../../hooks/Announcements/useFetchAnnouncements';
import {
  AnnouncementResponse,
  getAllAssignedPlantTasks,
  getAllPlantTasks,
  getAnnouncementsByParkId,
  getNParksAnnouncements,
  getOccurrencesByParkId,
  getPlantTasksByParkId,
  OccurrenceResponse,
  OccurrenceStatusEnum,
  PlantTaskResponse,
  PlantTaskStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { MdCheck, MdOutlineAnnouncement } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import PlantTasksTable from '../components/PlantTasksTable';
import moment from 'moment';
import { IoLeafOutline } from 'react-icons/io5';
import AnnouncementsCard from '../components/AnnouncementsCard';
import { renderSectionHeader, sectionHeader } from '../Manager/ManagerMainLanding';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';

export const flexColsStyles = 'flex flex-col md:flex-row md:justify-between gap-4';
export const sectionStyles = 'pr-4';
export const sectionHeaderIconStyles = 'text-lg h-7 w-7 rounded-full flex items-center justify-center mr-2';

const BAMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [desktop, setDesktop] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  
  // Data
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);

  useEffect(() => {
    if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
      fetchOccurencesByParkId(user.parkId);
      fetchPlantTasks();
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

  const fetchOccurencesByParkId = async (parkId: number) => {
    try {
      const response = await getOccurrencesByParkId(parkId);
      setOccurrences(response.data);
      // setError(null);
    } catch (err) {
      // setError('Failed to fetch announcements');
    }
  };

  const myTasks = useMemo(() => {
    return plantTasks
      ? plantTasks.filter((task) => task.assignedStaffId === user?.id)
      : [];
  }, [plantTasks]);

  const myPendingTasks = useMemo(() => {
    return myTasks
      ? myTasks?.filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
      : [];
  }, [myTasks]);

  const myOverduePlantTasks = useMemo(() => {
    return myTasks
      ? myTasks.filter(
          (task) =>
            task.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
            task.taskStatus !== PlantTaskStatusEnum.CANCELLED &&
            moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')),
        )
      : [];
  }, [plantTasks]);

  const urgentActionOccurrences = useMemo(() => {
    return occurrences
      ? occurrences?.filter((o) => o.occurrenceStatus === OccurrenceStatusEnum.URGENT_ACTION_REQUIRED)
      : [];
  }, [occurrences]);

  const needsAttentionOccurrences = useMemo(() => {
    return occurrences
      ? occurrences?.filter((o) => o.occurrenceStatus === OccurrenceStatusEnum.NEEDS_ATTENTION)
      : [];
  }, [occurrences]);

  // const pendingTasksCount = useMemo(() => {
  //   return plantTasks
  //     ? plantTasks.filter((task) => task.taskStatus === PlantTaskStatusEnum.OPEN || task.taskStatus === PlantTaskStatusEnum.IN_PROGRESS)
  //         .length
  //     : 0;
  // }, [plantTasks]);

  // const overduePlantTasksCount = useMemo(() => {
  //   return plantTasks
  //     ? plantTasks.filter(
  //         (task) =>
  //           task.taskStatus !== PlantTaskStatusEnum.COMPLETED &&
  //           task.taskStatus !== PlantTaskStatusEnum.CANCELLED &&
  //           moment().startOf('day').isAfter(moment(task.dueDate).startOf('day')),
  //       ).length
  //     : 0;
  // }, [plantTasks]);

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
      <Col span={desktop ? 21 : 24}>
        {/* -- [ Section: Park Overview ] -- */}
        <div id="part-1" className={sectionStyles}>
          {renderSectionHeader('Park Overview')}
          <div className={flexColsStyles}>
            {/* Tasks Cards  */}
            <div className="w-full h-86 flex-[2] flex flex-col gap-4">
              <Card className="h-full" styles={{ body: { padding: '1rem' } }}>
                <div className={sectionHeader} onClick={() => navigate('plant-tasks')}>
                  <div className={`${sectionHeaderIconStyles} bg-highlightGreen-400 text-white`}>
                    <FiInbox />
                  </div>
                  <LogoText className="text-lg mb-2">My Plant Tasks</LogoText>
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

                  {myOverduePlantTasks.length > 0 ? (
                    <div className="text-red-400 font-semibold mr-2">
                      {myOverduePlantTasks.length} Overdue Tasks
                    </div>
                  ) : (
                    <div className="text-red-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> No Overdue Tasks
                    </div>
                  )}
                </div>
              </Card>

              <Card className="h-full" styles={{ body: { padding: '1rem' } }} onClick={() => navigate('/occurrences')}>
                <div className={sectionHeader} onClick={() => navigate('/occurrences')}>
                  <div className={`${sectionHeaderIconStyles} bg-green-600 text-white`}>
                    <IoLeafOutline />
                  </div>
                  <LogoText className="text-lg mb-2">Occurrences</LogoText>
                </div>
   
                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {needsAttentionOccurrences?.length > 0 ? (
                    <div className="text-mustard-400 font-semibold mr-2">
                      {needsAttentionOccurrences.length}  Needs Attention
                    </div>
                  ) : (
                    <div className="text-mustard-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> 0 Needs Attention
                    </div>
                  )}

                  {urgentActionOccurrences.length > 0 ? (
                    <div className="text-red-400 font-semibold mr-2">
                      {urgentActionOccurrences.length} Urgent Action Needed
                    </div>
                  ) : (
                    <div className="text-red-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> No Urgent Action Needed
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* Announcements Card  */}
            <AnnouncementsCard announcements={announcements} />
          </div>
        </div>

        {/* -- [ Section: Park Overview ] -- */}
        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Plant Tasks', () => navigate('plant-tasks'))}
          {user && <PlantTasksTable userRole={user?.role as StaffType} plantTasks={myTasks} className="w-full" />}
        </div>

        {/* -- [ Section: Visitors Resource ] -- */}
        {/* <div id="part-4" className={sectionStyles}>
          {renderSectionHeader('Visitors')}
          <div className={flexColsStyles}>
            <Card className="w-full h-86 flex-[2]">
              <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={220} />
            </Card>
            <div className="flex flex-col flex-[1] gap-4">
              <Card className="w-full bg-green-100 flex-[1]" styles={{ body: { padding: '1rem' } }}>
                <LogoText className="">Live Visitor Count</LogoText>
                <div className="flex justify-center items-center h-full mt-2 opacity-50">No data</div>
              </Card>
              <Card className="w-full bg-green-100 flex-[1]" styles={{ body: { padding: '1rem' } }}>
                <LogoText className="">Total Weekly Count</LogoText>
                <div className="flex justify-center items-center h-full mt-2 opacity-50">No data</div>
              </Card>
            </div>
          </div>
        </div> */}
      </Col>
      {desktop && <Col span={3} className=''>
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
            // {
            //   key: 'part-3',
            //   href: '#part-3',
            //   title: 'Maintenance Tasks',
            // },
            // {
            //   key: 'part-4',
            //   href: '#part-4',
            //   title: 'Visitors',
            // },
          ]}
        />
      </Col>}
    </Row>
  );
};

export default BAMainLanding;
