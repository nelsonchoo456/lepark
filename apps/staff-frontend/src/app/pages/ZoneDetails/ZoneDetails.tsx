import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Carousel, Descriptions, Empty, Space, Tabs, Typography } from 'antd';
import { StaffResponse, StaffType } from '@lepark/data-access';
import ZoneStatusTag from './components/ZoneStatusTag';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictZone } from '../../hooks/Zones/useRestrictZone';
import InformationTab from './components/InformationTab';
import MapTab from './components/MapTab';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

const { Text } = Typography;

const ZoneDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const { id } = useParams();
  const { zone, loading } = useRestrictZone(id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!zone) {
    return null; // This will handle cases where the zone is not found or user doesn't have access
  }

  // const descriptionsItems = [
  //   {
  //     key: 'parkName',
  //     label: 'Park',
  //     children: <div className="font-semibold">{zone.parkName}</div>,
  //   },
  //   {
  //     key: 'parkId',
  //     label: 'Park ID',
  //     children: <div className="font-semibold">{zone.parkId}</div>,
  //   },
  // ];

  const tabsItems = [
    {
      key: 'about',
      label: 'Information',
      children: <InformationTab zone={zone} />,
    },
    {
      key: 'map',
      label: 'Map',
      children: zone ? <MapTab zone={zone} /> : <Empty description={'No Map data for this Park'}></Empty>,
    },
    {
      key: 'IoT',
      label: 'IoT',
      children: <Empty description={'IoT Coming Soon'}></Empty>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Zones Management',
      pathKey: '/zone',
      isMain: true,
    },
    {
      title: zone.name,
      pathKey: `/zone/${zone.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {zone?.images && zone.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {zone.images.map((url) => (
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
                <LogoText className="text-2xl py-2 m-0">{zone.name}</LogoText>
                <ZoneStatusTag>{formatEnumLabelToRemoveUnderscores(zone.zoneStatus)}</ZoneStatusTag>
              </Space>
              {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
                <Button
                  icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />}
                  type="text"
                  onClick={() => navigate(`/zone/${zone.id}/edit`)}
                />
              )}
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
              }}
            >
              {zone.description}
            </Typography.Paragraph>
            {/* <Descriptions items={descriptionsItems} column={1} size="small" /> */}
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

export default ZoneDetails;
