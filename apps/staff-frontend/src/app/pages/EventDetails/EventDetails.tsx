import React from 'react';
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
import { FaChalkboardTeacher, FaWalking, FaTheaterMasks, FaMicrophoneAlt, FaTrophy, FaUmbrellaBeach, FaUsers, FaUserFriends } from 'react-icons/fa';
import { GiPublicSpeaker } from 'react-icons/gi';
import { MdEvent, MdChildCare, MdNaturePeople, MdPets, MdFitnessCenter } from 'react-icons/md';

const { Text } = Typography;

const EventDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const { event, park, facility, loading } = useRestrictEvents(id);
  const navigate = useNavigate();

  const getEventTypeInfo = (eventType: EventTypeEnum) => {
    switch (eventType) {
      case EventTypeEnum.WORKSHOP:
        return { text: 'Workshop', icon: <FaChalkboardTeacher className="text-3xl mt-2" /> };
      case EventTypeEnum.EXHIBITION:
        return { text: 'Exhibition', icon: <MdEvent className="text-3xl mt-2" /> };
      case EventTypeEnum.GUIDED_TOUR:
        return { text: 'Guided Tour', icon: <FaWalking className="text-3xl mt-2" /> };
      case EventTypeEnum.PERFORMANCE:
        return { text: 'Performance', icon: <FaTheaterMasks className="text-3xl mt-2" /> };
      case EventTypeEnum.TALK:
        return { text: 'Talk', icon: <FaMicrophoneAlt className="text-3xl mt-2" /> };
      case EventTypeEnum.COMPETITION:
        return { text: 'Competition', icon: <FaTrophy className="text-3xl mt-2" /> };
      case EventTypeEnum.FESTIVAL:
        return { text: 'Festival', icon: <FaUmbrellaBeach className="text-3xl mt-2" /> };
      case EventTypeEnum.CONFERENCE:
        return { text: 'Conference', icon: <GiPublicSpeaker className="text-3xl mt-2" /> };
      default:
        return { text: 'Unknown', icon: <MdEvent className="text-3xl mt-2" /> };
    }
  };

  const getEventSuitabilityInfo = (suitability: EventSuitabilityEnum) => {
    switch (suitability) {
      case EventSuitabilityEnum.ANYONE:
        return { text: 'Anyone', icon: <FaUsers className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.FAMILIES_AND_FRIENDS:
        return { text: 'Families & Friends', icon: <FaUserFriends className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.CHILDREN:
        return { text: 'Children', icon: <MdChildCare className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.NATURE_ENTHUSIASTS:
        return { text: 'Nature Enthusiasts', icon: <MdNaturePeople className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.PETS:
        return { text: 'Pets', icon: <MdPets className="text-3xl mt-2" /> };
      case EventSuitabilityEnum.FITNESS_ENTHUSIASTS:
        return { text: 'Fitness Enthusiasts', icon: <MdFitnessCenter className="text-3xl mt-2" /> };
      default:
        return { text: 'Unknown', icon: <FaUsers className="text-3xl mt-2" /> };
    }
  };

  const descriptionsItems = [

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
      label: 'Tickets',
      children: <Empty description={'Tickets Coming Soon'}></Empty>,
    },
    {
      key: 'occupancy',
      label: 'Occupancy',
      children: <Empty description={'Occupancy Coming Soon'}></Empty>,
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
          defaultActiveKey="about"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default EventDetails;
