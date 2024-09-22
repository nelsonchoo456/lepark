import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Carousel, Descriptions, Empty, Space, Tabs, Typography, Alert } from 'antd';
import { StaffResponse, StaffType } from '@lepark/data-access';
import InformationTab from './components/InformationTab';
import ParkStatusTag from './components/ParkStatusTag';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';

import MapTab from './components/MapTab';
const { Text } = Typography;

const ParkDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { id } = useParams();
  const { park, loading } = useRestrictPark(id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!park) {
    return null; // This will handle cases where the park is not found or user doesn't have access
  }

  const descriptionsItems = [
    {
      key: 'address',
      label: 'Address',
      children: <div className="font-semibold">{park.address}</div>,
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      children: <div className="font-semibold">{park.contactNumber}</div>,
    },
  ];

  // Tabs Utility
  const tabsItems = [
    {
      key: 'about',
      label: 'Information',
      children: <InformationTab park={park} />,
    },
    {
      key: 'map',
      label: 'Map',
      children: park ? <MapTab park={park} /> : <Empty description={'No Map data for this Park'}></Empty>,
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

  const breadcrumbItems = [
    {
      title: 'Parks Management',
      pathKey: '/park',
      isMain: true,
    },
    {
      title: park.name,
      pathKey: `/park/${park.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {user?.role === StaffType.SUPERADMIN && <PageHeader2 breadcrumbItems={breadcrumbItems} />}
      <Card>
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
                <LogoText className="text-2xl py-2 m-0">{park.name}</LogoText>
                <ParkStatusTag>{park.parkStatus}</ParkStatusTag>
              </Space>
              {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
                <Button
                  icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />}
                  type="text"
                  onClick={() => navigate(`/park/${park.id}/edit`)}
                />
              )}
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
              }}
            >
              {park.description}
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
