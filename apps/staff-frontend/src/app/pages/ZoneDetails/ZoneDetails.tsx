import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Carousel, Descriptions, Empty, Space, Tabs, Typography, Alert } from 'antd';
import { StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import ZoneStatusTag from './components/ZoneStatusTag';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictZone } from '../../hooks/Zones/useRestrictZone';
import InformationTab from './components/InformationTab';

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

  const descriptionsItems = [
    {
      key: 'parkName',
      label: 'Park',
      children: <div className="font-semibold">{zone.parkName}</div>,
    },
    {
      key: 'parkId',
      label: 'Park ID',
      children: <div className="font-semibold">{zone.parkId}</div>,
    },
  ];

  const tabsItems = [
    {
      key: 'about',
      label: 'Information',
      children: <InformationTab zone={zone} />,
    },
    {
      key: 'attractions',
      label: 'Attractions',
      children: <Empty description={'Attractions Coming Soon'}></Empty>,
    },
    {
      key: 'events',
      label: 'Events',
      children: <Empty description={'Events Coming Soon'}></Empty>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Zones Management',
      pathKey: '/zones',
      isMain: true,
    },
    {
      title: zone.name,
      pathKey: `/zones/${zone.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {user?.role === StaffType.SUPERADMIN && <PageHeader2 breadcrumbItems={breadcrumbItems} />}
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <Empty description="No Image" />
            </div>
          </div>
          <div className="flex-1 flex-col flex">
            <div className="w-full flex justify-between items-center">
              <Space>
                <LogoText className="text-2xl py-2 m-0">{zone.name}</LogoText>
                <ZoneStatusTag>{zone.zoneStatus}</ZoneStatusTag>
              </Space>
              {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER) && (
                <Button
                  icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />}
                  type="text"
                  onClick={() => navigate(`/zones/${zone.id}/edit`)}
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

export default ZoneDetails;