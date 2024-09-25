import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentWrapperDark, LogoText, useAuth } from '@lepark/common-ui';
import { Button, Card, Carousel, Descriptions, Empty, Flex, notification, Space, Tabs, Tag, Tooltip, Typography } from 'antd';
import { getAttractionById, AttractionResponse, StaffResponse, StaffType, getParkById, ParkResponse } from '@lepark/data-access';
import { RiEdit2Line } from 'react-icons/ri';
import PageHeader2 from '../../components/main/PageHeader2';
import AttractionStatusTag from './components/AttractionStatusTag';
import InformationTab from './components/InformationTab';
import { FiExternalLink } from 'react-icons/fi';
import LocationTab from './components/LocationTab';
import { useRestrictAttractions } from '../../hooks/Attractions/useRestrictAttractions';
import TicketsTab from './components/TicketsTab';
import { useLocation } from 'react-router-dom';

const AttractionDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const { id } = useParams();
  const { attraction, park, loading } = useRestrictAttractions(id);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [, setRefreshToggle] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const triggerFetch = useCallback(() => {
    setRefreshToggle((prev) => !prev);
  }, []);

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
    // {
    //   key: 'location',
    //   label: 'Location',
    //   children: <div className="font-semibold">{`Lat: ${attraction?.lat}, Lng: ${attraction?.lng}`}</div>,
    // },
  ];

  const tabsItems = [
    {
      key: 'information',
      label: 'Information',
      children: attraction && park ? <InformationTab attraction={attraction} park={park} /> : <></>,
    },
    {
      key: 'location',
      label: 'Location',
      children: attraction && park ? <LocationTab attraction={attraction} park={park} /> : <></>,
    },
    {
      key: 'tickets',
      label: 'Tickets',
      children: attraction ? <TicketsTab attraction={attraction} onTicketListingCreated={triggerFetch} /> : <></>,
    },
    {
      key: 'occupancy',
      label: 'Occupancy',
      children: <Empty description={'Occupancy Coming Soon'}></Empty>,
    },
  ];

  const breadcrumbItems = [
    {
      title: 'Attractions Management',
      pathKey: '/attraction',
      isMain: true,
    },
    {
      title: attraction?.title ? attraction?.title : 'Details',
      pathKey: `/attraction/${attraction?.id}`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <div className="md:flex w-full gap-4">
          <div className="h-64 flex-1 max-w-full overflow-hidden rounded-lg shadow-lg">
            {attraction?.images && attraction.images.length > 0 ? (
              <Carousel style={{ maxWidth: '100%' }}>
                {attraction?.images?.map((url) => (
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
                <LogoText className="text-2xl py-2 m-0">{attraction?.title}</LogoText>
                <AttractionStatusTag status={attraction?.status} />
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
              {attraction?.description}
            </Typography.Paragraph>
            <Descriptions items={descriptionsItems} column={1} size="small" labelStyle={{ alignSelf: 'center' }} />
          </div>
        </div>

        <Tabs
          centered
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            navigate(`/attraction/${id}?tab=${key}`, { replace: true });
          }}
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default AttractionDetails;
