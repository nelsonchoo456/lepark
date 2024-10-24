import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Carousel, Descriptions, Empty, Flex, Space, Tabs, Tooltip, Typography } from 'antd';
import { EventSuitabilityEnum, EventTypeEnum, StaffResponse, StaffType } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import { FiExternalLink } from 'react-icons/fi';
import PageHeader2 from '../../components/main/PageHeader2';
import EventStatusTag from './components/EventStatusTag';
import InformationTab from './components/InformationTab';
import LocationTab from './components/LocationTab';
import { useRestrictEvents } from '../../hooks/Events/useRestrictEvents';
import { WiDaySunny } from 'react-icons/wi';
import {
  FaChalkboardTeacher,
  FaWalking,
  FaTheaterMasks,
  FaMicrophoneAlt,
  FaTrophy,
  FaUmbrellaBeach,
  FaUsers,
  FaUserFriends,
} from 'react-icons/fa';
import { GiPublicSpeaker } from 'react-icons/gi';
import { MdEvent, MdChildCare, MdNaturePeople, MdPets, MdFitnessCenter } from 'react-icons/md';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import TicketsTab from './components/TicketsTab';
import TicketSalesTab from './components/TicketSalesTab';
import { useLocation } from 'react-router-dom';
import DashboardTab from './components/DashboardTab';

const { Text } = Typography;

const EventDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const { event, park, facility, loading } = useRestrictEvents(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('information');
  const [, setRefreshToggle] = useState(false);
  const location = useLocation();

  const getEventTypeInfo = (eventType: EventTypeEnum) => {
    switch (eventType) {
      case EventTypeEnum.WORKSHOP:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.WORKSHOP), icon: <FaChalkboardTeacher className="text-3xl mt-2" /> };
      case EventTypeEnum.EXHIBITION:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.EXHIBITION), icon: <MdEvent className="text-3xl mt-2" /> };
      case EventTypeEnum.GUIDED_TOUR:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.GUIDED_TOUR), icon: <FaWalking className="text-3xl mt-2" /> };
      case EventTypeEnum.PERFORMANCE:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.PERFORMANCE), icon: <FaTheaterMasks className="text-3xl mt-2" /> };
      case EventTypeEnum.TALK:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.TALK), icon: <FaMicrophoneAlt className="text-3xl mt-2" /> };
      case EventTypeEnum.COMPETITION:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.COMPETITION), icon: <FaTrophy className="text-3xl mt-2" /> };
      case EventTypeEnum.FESTIVAL:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.FESTIVAL), icon: <FaUmbrellaBeach className="text-3xl mt-2" /> };
      case EventTypeEnum.CONFERENCE:
        return { text: formatEnumLabelToRemoveUnderscores(EventTypeEnum.CONFERENCE), icon: <GiPublicSpeaker className="text-3xl mt-2" /> };
      default:
        return { text: 'Unknown', icon: <MdEvent className="text-3xl mt-2" /> };
    }
  };

  const getEventSuitabilityInfo = (suitability: EventSuitabilityEnum) => {
    switch (suitability) {
      case EventSuitabilityEnum.ANYONE:
        return { text: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.ANYONE), icon: <FaUsers className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.FAMILIES_AND_FRIENDS:
        return { text: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.FAMILIES_AND_FRIENDS), icon: <FaUserFriends className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.CHILDREN:
        return { text: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.CHILDREN), icon: <MdChildCare className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.NATURE_ENTHUSIASTS:
        return { text: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.NATURE_ENTHUSIASTS), icon: <MdNaturePeople className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.PETS:
        return { text: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.PETS), icon: <MdPets className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.FITNESS_ENTHUSIASTS:
        return { text: formatEnumLabelToRemoveUnderscores(EventSuitabilityEnum.FITNESS_ENTHUSIASTS), icon: <MdFitnessCenter className="text-3xl mt-2" /> };
      default:
        return { text: 'Unknown', icon: <FaUsers className="text-3xl mt-2" /> };
    }
  };

  const triggerFetch = useCallback(() => {
    setRefreshToggle((prev) => !prev);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const descriptionsItems = [
    {
      key: 'facility',
      label: 'Location',
      children: (
        <Flex justify="space-between" align="center">
          <span className="font-semibold">{facility?.name || 'Loading...'}</span>
          {facility && (
            <Tooltip title="Go to Facility">
              <Button type="link" icon={<FiExternalLink />} onClick={() => navigate(`/facilities/${facility.id}`)} />
            </Tooltip>
          )}
        </Flex>
      ),
    },

    {
      key: 'park',
      label: 'Park',
      children: (
        <Flex justify="space-between" align="center">
          <span className="font-semibold">{park?.name || 'Loading...'}</span>
          {park && (
            <Tooltip title="Go to Park">
              <Button type="link" icon={<FiExternalLink />} onClick={() => navigate(`/park/${park.id}`)} />
            </Tooltip>
          )}
        </Flex>
      ),
    },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: event && facility && park ? <InformationTab event={event} facility={facility} park={park} /> : <></>,
    },
    {
      key: 'location',
      label: 'Location',
      children: event && facility && park ? <LocationTab event={event} facility={facility} park={park} /> : <></>,
    },
    {
      key: 'tickets',
      label: 'Ticket Listings',
      children: event ? <TicketsTab event={event} onTicketListingCreated={triggerFetch} /> : <></>,
    },
    {
      key: 'ticketSales',
      label: 'Ticket Sales',
      children: event ? <TicketSalesTab event={event} /> : <></>,
    },
    {
      key: 'dashboard',
      label: 'Dashboard',
      children: event ? <DashboardTab eventId={event.id} /> : <></>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Events Management',
      pathKey: '/event',
      isMain: true,
    },
    {
      title: event?.title ? event?.title : 'Details',
      pathKey: `/event/${event?.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {event?.images && event.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {event?.images?.map((url) => (
                  <div key={url}>
                    <div
                      style={{
                        backgroundImage: `url('${url}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        overflow: 'hidden',
                      }}
                      className="h-64 flex-1 rounded-lg shadow-lg p-4"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <Empty description="No Image" />
              </div>
            )}
          </div>
          <div className="flex-1 flex-col flex">
            <div className="w-full flex justify-between items-center">
              <Space>
                <LogoText className="text-2xl py-2 m-0">{event?.title}</LogoText>
                <EventStatusTag status={event?.status} />
              </Space>
              {user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER ? (
                <Button icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />} type="text" onClick={() => navigate(`edit`)} />
              ) : null}
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
              }}
            >
              {event?.description}
            </Typography.Paragraph>
            <Descriptions items={descriptionsItems} column={1} size="small" labelStyle={{ alignSelf: 'center' }} />
            <div className="flex h-24 w-full gap-2 mt-auto">
              {event ? (
                <>
                  <div className="bg-green-50 h-full w-28 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                    {getEventTypeInfo(event.type).icon}
                    <p className="text-xs mt-2">{getEventTypeInfo(event.type).text}</p>
                  </div>
                  <div className="bg-green-50 h-full w-28 rounded-lg flex flex-col justify-center text-center items-center text-green-600 p-1">
                    {getEventSuitabilityInfo(event.suitability).icon}
                    <p className="text-xs mt-2">{getEventSuitabilityInfo(event.suitability).text}</p>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 h-full w-full rounded-lg flex justify-center items-center text-green-600">
                  <p>Event data not available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs
          centered
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            navigate(`/event/${id}?tab=${key}`, { replace: true });
          }}
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default EventDetails;
