import React, { useState, useEffect, useRef } from 'react';
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

const { Text } = Typography;

const AttractionDetails = () => {
  const { user } = useAuth<StaffResponse>();
  const [attraction, setAttraction] = useState<AttractionResponse>();
  const navigate = useNavigate();
  const { id } = useParams();
  const notificationShown = useRef(false);
  const [park, setPark] = useState<ParkResponse>();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const attractionRes = await getAttractionById(id);
        if (attractionRes.status === 200) {
          setAttraction(attractionRes.data as AttractionResponse);

          // Fetch park details
          if (attractionRes.data.parkId) {
            const parkRes = await getParkById(attractionRes.data.parkId);
            if (parkRes.status === 200) {
              setPark(parkRes.data as ParkResponse);
            }
          }
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Error',
            description: 'An error occurred while fetching the attraction details.',
          });
          notificationShown.current = true;
        }
        navigate('/attraction');
      }
    };
    fetchData();
  }, [id]);

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
                <Button
                  icon={<RiEdit2Line className="text-lg ml-auto mr-0 r-0" />}
                  type="text"
                  onClick={() => navigate(`edit`)}
                />
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
          defaultActiveKey="about"
          items={tabsItems}
          renderTabBar={(props, DefaultTabBar) => <DefaultTabBar {...props} className="border-b-[1px] border-gray-400" />}
          className="mt-4"
        />
      </Card>
    </ContentWrapperDark>
  );
};

export default AttractionDetails;
