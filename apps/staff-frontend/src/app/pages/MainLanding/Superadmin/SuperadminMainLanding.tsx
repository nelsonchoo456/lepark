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
  getAllAnnouncements,
  getAllAssignedPlantTasks,
  getAllParks,
  getAllPlantTasks,
  getAnnouncementsByParkId,
  getNParksAnnouncements,
  getPlantTasksByParkId,
  getZonesByParkId,
  ParkResponse,
  ParkStatusEnum,
  PlantTaskResponse,
  PlantTaskStatusEnum,
  StaffResponse,
  StaffType,
  ZoneResponse,
} from '@lepark/data-access';
import { MdCheck, MdOutlineAnnouncement } from 'react-icons/md';
import { FiInbox } from 'react-icons/fi';
import PlantTasksTable from '../components/PlantTasksTable';
import moment from 'moment';
import { TbTrees } from 'react-icons/tb';
import dayjs from 'dayjs';

export const flexColsStyles = 'flex flex-col md:flex-row md:justify-between gap-4';
export const sectionStyles = 'pr-4';
export const sectionHeaderIconStyles = 'text-lg h-7 w-7 rounded-full flex items-center justify-center mr-2';

export const isParkOpen = (park: ParkResponse) => {
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

const SuperadminMainLanding = () => {
  const { user } = useAuth<StaffResponse>();
  const now = new Date();

  // Data
  const [parks, setParks] = useState<(ParkResponse & { zones: ZoneResponse[] })[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);

  useEffect(() => {
    if (user) {
      fetchParks();
      fetchAnnouncements();
    }
  }, [user]);

  const fetchParks = async () => {
    try {
      const response = await getAllParks();
      if (response.status === 200) {
        const parksWithZones = await Promise.all(
          response.data.map(async (p: any) => {
            const zonesRes = await getZonesByParkId(p.id);
            p.zones = zonesRes.status === 200 ? zonesRes.data : [];
            return p;
          }),
        );
        console.log(parksWithZones);
        setParks(parksWithZones);
      }
    } catch (err) {
      // setError('Failed to fetch announcements');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await getNParksAnnouncements();
      setAnnouncements(response.data);
    } catch (err) {
      // setError('Failed to fetch announcements');
    }
  };

  const openParks = useMemo(() => {
    return parks.filter((park) => {
      return (park.parkStatus === ParkStatusEnum.OPEN || park.parkStatus === ParkStatusEnum.LIMITED_ACCESS) && isParkOpen(park);
    });
  }, [parks]);

  const closedParks = useMemo(() => {
    return parks.filter((park) => {
      return park.parkStatus === ParkStatusEnum.CLOSED || !isParkOpen(park);
    });
  }, [parks]);

  const constructionParks = useMemo(() => {
    return parks.filter((park) => {
      return park.parkStatus === ParkStatusEnum.UNDER_CONSTRUCTION;
    });
  }, [parks]);

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
          {renderSectionHeader('NParks Overview')}
          <div className={flexColsStyles}>
            {/* Tasks Cards  */}
            <div className="w-full flex-[2] flex flex-col gap-4">
              <Card className="flex flex-col h-full" styles={{ body: { padding: '1rem' } }}>
                {/* Header Section */}
                <div className="flex items-center mb-2">
                  <div className={`${sectionHeaderIconStyles} bg-green-400 text-white`}>
                    <TbTrees />
                  </div>
                  <LogoText className="text-lg">Parks</LogoText>
                </div>

                <div className="h-full flex w-full gap-2">
                  <div className="rounded-md bg-green-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-green-200">
                    <strong className='text-lg'>{openParks.length}</strong><br/>
                    Open Now
                  </div>
                  <div className="rounded-md bg-red-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-red-200">
                    <strong className='text-lg'>{closedParks.length}</strong><br/>
                    Closed Now
                  </div>
                  <div className="rounded-md bg-mustard-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-mustard-200">
                    <strong className='text-lg'>{constructionParks.length}</strong><br/>
                    Under Construction
                  </div>
                </div>
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
                <LogoText className="">Total Weekly Count</LogoText>
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
              title: 'NParks Overview',
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

export default SuperadminMainLanding;
