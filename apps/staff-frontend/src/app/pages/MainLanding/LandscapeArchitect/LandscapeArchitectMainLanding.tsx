import { ContentWrapper, LogoText, useAuth } from '@lepark/common-ui';
import { Anchor, Button, Card, Col, Flex, Row, Table, TableProps, Tooltip } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useMemo, useState } from 'react';
import { MdCheck, MdSensors } from 'react-icons/md';
import { FiEye, FiInbox } from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { SCREEN_LG } from '../../../config/breakpoints';
import {
  AnnouncementResponse,
  BookingResponse,
  BookingStatusEnum,
  FacilityResponse,
  FacilityStatusEnum,
  getAllAssignedMaintenanceTasks,
  getAllFacilities,
  getAllMaintenanceTasks,
  getAllZones,
  getAnnouncementsByParkId,
  getFacilitiesByParkId,
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
import { TbBuilding, TbBuildingEstate, TbTree, TbTrees } from 'react-icons/tb';
import { getSensorsByParkId, getHubsByParkId, SensorResponse, HubResponse, SensorStatusEnum, HubStatusEnum } from '@lepark/data-access';
import dayjs from 'dayjs';
import { useFetchBookings } from '../../../hooks/Booking/useFetchBookings';

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

export const isFacilityOpen = (park: FacilityResponse) => {
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
  const { bookings, loading, triggerFetch } = useFetchBookings();

  // State
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);

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
      fetchZones();
      fetchFacilities();
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

  const fetchFacilities = async () => {
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllFacilities();
      } else if (user?.parkId) {
        response = await getFacilitiesByParkId(user.parkId);
      }
      setFacilities(response?.data || []);
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

  const openFacilities = useMemo(() => {
    return facilities.filter((f) => {
      return f.facilityStatus === FacilityStatusEnum.OPEN && isFacilityOpen(f);
    });
  }, [facilities]);

  const closedFacilities = useMemo(() => {
    return facilities.filter((f) => {
      return f.facilityStatus === FacilityStatusEnum.CLOSED || !isFacilityOpen(f);
    });
  }, [facilities]);

  const constructionFacilities = useMemo(() => {
    return facilities.filter((f) => {
      return f.facilityStatus === FacilityStatusEnum.UNDER_MAINTENANCE;
    });
  }, [facilities]);

  const pendingBookings = useMemo(() => {
    return bookings.filter((b) => {
      return b.bookingStatus === BookingStatusEnum.PENDING;
    });
  }, [bookings]);

  const pendingPayments = useMemo(() => {
    return bookings.filter((b) => {
      return b.bookingStatus === BookingStatusEnum.APPROVED_PENDING_PAYMENT;
    });
  }, [bookings]);

  const bookingColumns: TableProps<BookingResponse>['columns'] = [
    {
      title: 'Booking Purpose',
      dataIndex: 'bookingPurpose',
      key: 'bookingPurpose',
      render: (text) => <div className="font-semibold">{text}</div>,
      sorter: (a, b) => a.bookingPurpose.localeCompare(b.bookingPurpose),
      width: '15%',
    },
    {
      title: 'Pax',
      dataIndex: 'pax',
      key: 'pax',
      render: (text) => <div>{text}</div>,
      sorter: (a, b) => a.pax - b.pax,
      width: '10%',
    },
    {
      title: 'Date Start',
      dataIndex: 'dateStart',
      key: 'dateStart',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateStart).unix() - moment(b.dateStart).unix(),
      width: '15%',
    },
    {
      title: 'Date End',
      dataIndex: 'dateEnd',
      key: 'dateEnd',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateEnd).unix() - moment(b.dateEnd).unix(),
      width: '15%',
    },
    {
      title: 'Date Booked',
      dataIndex: 'dateBooked',
      key: 'dateBooked',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateBooked).unix() - moment(b.dateBooked).unix(),
      width: '15%',
    },
    {
      title: 'Payment Deadline',
      dataIndex: 'paymentDeadline',
      key: 'paymentDeadline',
      render: (text) => (text ? moment(text).format('D MMM YY') : 'N/A'),
      sorter: (a, b) => moment(a.paymentDeadline).unix() - moment(b.paymentDeadline).unix(),
      width: '15%',
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
      render: (facility) => <div>{facility.name}</div>,
      filters: Array.from(new Set(bookings.map((booking) => booking.facility?.name).filter((name) => name !== undefined))).map((name) => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.facility?.name === value,
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="center" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigate(`/facilities/bookings/${record.id}`)} />
          </Tooltip>
        </Flex>
      ),
      width: '1%',
    },
  ];

  return (
    <Row>
      <Col span={desktop ? 21 : 24}>
        {/* -- [ Section: Maintenance Overview ] -- */}
        <div id="part-1" className={sectionStyles}>
          {renderSectionHeader('Overview')}
          <div className={flexColsStyles}>
            {/* Tasks Card */}
            <div className="w-full h-86 flex-[2] flex flex-col gap-4">
              <div className="w-full flex-[2] flex flex-col gap-4">
                <Card className="flex flex-col h-full" styles={{ body: { padding: '1rem' } }}>
                  {/* Header Section */}
                  <div className="flex items-center mb-2">
                    <div className={`${sectionHeaderIconStyles} bg-green-400 text-white`}>
                      <TbTrees />
                    </div>
                    <LogoText className="text-lg">Zones</LogoText>
                  </div>

                  <div className="flex w-full gap-2">
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
                <Card className="flex flex-col h-full" styles={{ body: { padding: '1rem' } }}>
                  {/* Header Section */}
                  <div className="flex items-center mb-2">
                    <div className={`${sectionHeaderIconStyles} bg-sky-400 text-white`}>
                      <TbBuildingEstate />
                    </div>
                    <LogoText className="text-lg">Facilities</LogoText>
                  </div>

                  <div className="flex w-full gap-2">
                    <div className="rounded-md bg-green-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-green-200">
                      <strong className="text-lg">{openFacilities.length}</strong>
                      <br />
                      Open Now
                    </div>
                    <div className="rounded-md bg-red-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-red-200">
                      <strong className="text-lg">{closedFacilities.length}</strong>
                      <br />
                      Closed Now
                    </div>
                    <div className="rounded-md bg-mustard-50 flex-[1] text-center py-4 md:pt-8 border-l-4 border-mustard-200">
                      <strong className="text-lg">{constructionFacilities.length}</strong>
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

        <div id="part-2" className={sectionStyles}>
          {renderSectionHeader('Venue Bookings', () => navigate('/facilities/bookings'))}
          <div className={`${flexColsStyles} mb-4 overflow-x-scroll`}>
            {pendingBookings && pendingBookings?.length > 0 ? (
              <div className="w-full flex-[2] flex flex-col w-full">
                <div className="flex items-center font-semibold text-mustard-500">
                  <div className={`bg-mustard-400 text-white h-6 w-6 flex justify-center items-center rounded-full mr-2`}>
                    {pendingBookings.length}
                  </div>
                  Pending Bookings
                </div>
                <Table dataSource={pendingBookings.slice(0, 3)} columns={bookingColumns} rowKey="id" size="small" pagination={false} />
                {pendingBookings?.length > 3 && (
                  <Button type="dashed" className="-mt-[1px] rounded-0 text-secondary" onClick={() => navigate('maintenance-tasks')}>
                    Go to Bookings to view more
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center font-semibold text-mustard-500">
                <div className={`${sectionHeaderIconStyles} bg-mustard-400 text-white h-6 w-6`}>
                  <MdCheck />
                </div>
                No Pending Bookings
              </div>
            )}
          </div>
          <div className={`${flexColsStyles} mb-4 overflow-x-scroll`}>
            {pendingPayments && pendingPayments?.length > 0 ? (
              <div className="w-full flex-[2] flex flex-col w-full">
                <div className="flex items-center font-semibold text-mustard-500">
                  <div className={`bg-mustard-400 text-white h-6 w-6 flex justify-center items-center rounded-full mr-2`}>
                    {pendingPayments.length}
                  </div>
                  Pending Payments
                </div>
                <Table dataSource={pendingPayments.slice(0, 3)} columns={bookingColumns} rowKey="id" size="small" pagination={false} />
                {pendingPayments?.length > 3 && (
                  <Button type="dashed" className="-mt-[1px] rounded-0 text-secondary" onClick={() => navigate('maintenance-tasks')}>
                    Go to Bookings to view more
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center font-semibold text-mustard-500">
                <div className={`${sectionHeaderIconStyles} bg-mustard-400 text-white h-6 w-6`}>
                  <MdCheck />
                </div>
                No Pending Payments
              </div>
            )}
          </div>
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
                title: 'Venue Bookings',
              },
            ]}
          />
        </Col>
      )}
    </Row>
  );
};

export default LandscapeArchitect;
