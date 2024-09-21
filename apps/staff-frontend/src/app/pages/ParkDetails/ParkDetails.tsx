import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageHeader from '../../components/main/PageHeader';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Carousel, Descriptions, Empty, Flex, notification, Space, Tabs, Tag, Typography } from 'antd';
import { getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { FiSun } from 'react-icons/fi';
import InformationTab from './components/InformationTab';
import ParkStatusTag from './components/ParkStatusTag';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import MapTab from './components/MapTab';
const { Text } = Typography;

const ParkDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const [park, setPark] = useState<ParkResponse>();
  const navigate = useNavigate();
  const { id } = useParams();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      try {
        if (user.role !== StaffType.SUPERADMIN && user.parkId !== parseInt(id)) {
          throw new Error('Unauthorized access');
        }

        const parkRes = await getParkById(parseInt(id));
        if (parkRes.status === 200) {
          setPark(parkRes.data);
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Error',
            description: 'You do not have permission to view this park.',
          });
          notificationShown.current = true;
        }
        navigate('/');
      }
    };
    fetchData();
  }, [id, navigate, user]);

  const descriptionsItems = [
    {
      key: 'address',
      label: 'Address',
      children: <div className="font-semibold">{park?.address}</div>,
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: <div className="font-semibold">{park?.contactNumber}</div>,
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'Information',
      children: park ? <InformationTab park={park} /> : <></>,
    },
    {
      key: 'map',
      label: 'Map',
      children: park ? <MapTab park={park} /> : <></>,
    },
    {
      key: 'zones',
      label: 'Zones',
      // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
      children: <Empty description={'Zones Coming Soon'}></Empty>,
    },
    {
      key: 'attractions',
      label: 'Attractions',
      // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
      children: <Empty description={'Attractions Coming Soon'}></Empty>,
    },
    {
      key: 'events',
      label: 'Events',
      // children: <ActivityLogs occurrenceId={occurrences[0].id} activityLogs={occurrences[0].activityLogs} />,
      children: <Empty description={'Events Coming Soon'}></Empty>,
    },
  ];

  const contentStyle: React.CSSProperties = {
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
    width: '100%',
  };

  const breadcrumbItems = [
    {
      title: 'Parks Management',
      pathKey: '/park',
      isMain: true,
    },
    {
      title: park?.name ? park?.name : 'Details',
      pathKey: `/park/${park?.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {user?.role === StaffType.SUPERADMIN && <PageHeader2 breadcrumbItems={breadcrumbItems} />}
      <Card>
        {/* <Card className='mb-4 bg-white' styles={{ body: { padding: 0 }}} bordered={false}> */}
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {park?.images && park.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {park?.images?.map((url) => (
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
                <LogoText className="text-2xl py-2 m-0">{park?.name}</LogoText>
                <ParkStatusTag>{park?.parkStatus}</ParkStatusTag>
              </Space>
              {user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER ? (
                <Button
                  icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />}
                  type="text"
                  onClick={() => navigate(`/park/${park?.id}/edit`)}
                />
              ) : null}
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
              }}
            >
              {park?.description}
            </Typography.Paragraph>
            <Descriptions items={descriptionsItems} column={1} size="small" />
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

export default ParkDetails;
