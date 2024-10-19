import { ContentWrapper, ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Badge, Card, Col, Empty, List, Row, Statistic, Table, Typography } from 'antd';
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
  getPlantTasksByParkId,
  PlantTaskResponse,
  PlantTaskStatusEnum,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { MdCheck, MdOutlineAnnouncement } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import PlantTasksTable from '../components/PlantTasksTable';
import moment from 'moment';

export const flexColsStyles = 'flex flex-col md:flex-row md:justify-between gap-4';
export const sectionStyles = 'pr-4';
export const sectionHeaderIconStyles = 'text-lg h-7 w-7 rounded-full flex items-center justify-center mr-2';

const ManagerMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  
  // Data
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);

  useEffect(() => {
    if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
      fetchPlantTasks();
    }
  }, [user]);

  const fetchAnnouncementsByParkId = async (parkId: number) => {
    try {
      const response = await getAnnouncementsByParkId(parkId);
      setAnnouncements(response.data);
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

  const renderSectionHeader = (title: string) => {
    return (
      <div className="sticky top-0 pt-4 z-20 bg-gray-100">
        <LogoText className={`text-lg font-semibold pb-2 pt-0`}>
          <div className={`-z-10  px-2 rounded`}>{title}</div>
        </LogoText>
        <div className="w-full h-[1px] bg-gray-400/40 mb-4" />
      </div>
    );
  };

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
                <div className="flex">
                  <div className={`${sectionHeaderIconStyles} bg-highlightGreen-400 text-white`}>
                    <FiInbox />
                  </div>
                  <LogoText className="text-lg mb-2">Plant Tasks</LogoText>
                </div>
                <div className="h-full flex flex-col gap-2 pl-4 ml-3 border-l-[2px]">
                  {pendingTasksCount > 0 ? (
                    <div className="text-mustard-400 font-semibold mr-2">
                      {pendingTasksCount} Pending Tasks
                    </div>
                  ) : (
                    <div className="text-mustard-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> No Pending Tasks
                    </div>
                  )}

                  {overduePlantTasksCount > 0 ? (
                    <div className="text-red-400 font-semibold mr-2">
                      {overduePlantTasksCount} Pending Tasks
                    </div>
                  ) : (
                    <div className="text-red-400 gap-3 flex items-center">
                      <MdCheck className='text-lg'/> No Overdue Tasks
                    </div>
                  )}
                </div>
              </Card>
              <Card className="h-full" styles={{ body: { padding: '1rem' } }}>
                <div className="flex">
                  <div className={`${sectionHeaderIconStyles} bg-sky-400 text-white`}>
                    <FiInbox />
                  </div>
                  <LogoText className="text-lg mb-2">Maintenance Tasks</LogoText>
                </div>
                <div className="flex justify-center items-center h-full opacity-50">No data</div>
              </Card>
            </div>

            {/* Announcements Card  */}
            <Card className="w-full h-86 flex-[1] overflow-y-scroll" styles={{ body: { padding: '1rem' } }}>
              <div className="flex">
                <div className={`${sectionHeaderIconStyles} bg-red-400 text-white`}>
                  <MdOutlineAnnouncement />
                </div>
                <LogoText className="text-lg mb-2">Announcements</LogoText>
              </div>
              {announcements?.length > 0 ? (
                announcements.map((announcement: AnnouncementResponse) => (
                  <div
                    className="w-full hover:bg-green-50/20 px-2 pt-2 border-b-[1px] cursor-pointer hover:bg-green-50/50"
                    key={announcement.id}
                  >
                    <strong className="text-green-400 hover:text-green-200">{announcement.title}</strong>
                    <Typography.Paragraph
                      ellipsis={{
                        rows: 1,
                      }}
                    >
                      {announcement.content}
                    </Typography.Paragraph>
                  </div>
                ))
                
              ) : (
                <Empty />
              )}
            </Card>
          </div>
        </div>

        {/* -- [ Section: Park Overview ] -- */}
        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Plant Tasks')}
          {user && <PlantTasksTable userRole={user?.role as StaffType} plantTasks={plantTasks} className="w-full" />}
        </div>

        <div id="part-3" className={sectionStyles}>
          {renderSectionHeader('Maintenance Tasks')}
          <Empty description="Maintenance Tasks coming soon..." className="md:py-8" />
        </div>

        {/* -- [ Section: Visitors Resource ] -- */}
        <div id="part-4" className={sectionStyles}>
          {renderSectionHeader('Visitors')}
          {/* Visitors */}
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
                <LogoText className="">Live Visitor Count</LogoText>
                <div className="flex justify-center items-center h-full mt-2 opacity-50">No data</div>
              </Card>
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
