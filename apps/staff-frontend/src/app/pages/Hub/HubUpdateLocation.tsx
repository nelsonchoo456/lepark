import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../components/map/DraggableMarker';
import { getZonesByParkId, HubResponse, updateHubDetails, ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { COLORS } from '../../config/colors';
import { Button, Card, Divider, Flex, Form, message, Result, Select, Tooltip } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useRestrictHub } from '../../hooks/Hubs/useRestrictHubs';
import { ContentWrapperDark } from '@lepark/common-ui';
import PageHeader2 from '../../components/main/PageHeader2';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const HubUpdateLocation = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const { hub, loading } = useRestrictHub(hubId);
  const [messageApi, contextHolder] = message.useMessage();
  const [createdData, setCreatedData] = useState<HubResponse | null>();
  const navigate = useNavigate();

  // Map Values
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();

  useEffect(() => {
    if (hub?.lat && hub?.long) adjustLatLng({ lat: hub?.lat, lng: hub?.long });
  }, [hub]);

  const handleSubmit = async () => {
    if (!hub) return;
    try {
      const finalData = {
        lat,
        long: lng,
      };
      const response = await updateHubDetails(hub.id, finalData);

      if (response.status === 200) {
        setCreatedData(response.data);
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'Unable to place Hub in Zone. Please try again later.',
      });
    }
  };

  const adjustLatLng = ({ lat, lng }: AdjustLatLngInterface) => {
    if (lat) {
      setLat(lat);
    }
    if (lng) {
      setLng(lng);
    }
  };

  const breadcrumbItems = [
    {
      title: 'Hub Management',
      pathKey: '/hubs',
      isMain: true,
    },
    {
      title: hub?.identifierNumber ? hub?.identifierNumber : 'Details',
      pathKey: `/hubs/${hub?.id}`,
    },
    {
      title: 'Edit Location',
      pathKey: `/hubs/${hub?.id}/edit-location`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        {!createdData ? (
          <>
            <div>
              <span className="mr-1 text-error">*</span>Drag the Marker around within the boundaries of the Zone.
            </div>
            {!hub?.zone ? (
              <div
                style={{
                  height: '60vh',
                  zIndex: 1,
                }}
                className="my-4 rounded overflow-hidden relative"
              >
                <Tooltip title="Current Zone cannot be found">
                  <div className="bg-gray-900/40 flex w-full h-full absolute" style={{ zIndex: 1000 }}></div>
                </Tooltip>
                <MapContainer
                  center={[1.287953, 103.851784]}
                  zoom={11}
                  className="leaflet-mapview-container"
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                </MapContainer>
              </div>
            ) : (
              <div
                style={{
                  height: '60vh',
                  zIndex: 1,
                }}
                className="my-4 rounded overflow-hidden"
              >
                <MapContainer
                  center={[1.287953, 103.851784]}
                  zoom={11}
                  className="leaflet-mapview-container"
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  <PolygonFitBounds geom={hub?.zone?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={hub?.zone?.name} />
                  <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />
                </MapContainer>
              </div>
            )}
            {hub?.zone?.geom?.coordinates && hub?.zone?.geom.coordinates.length > 0 && (
              <div className="font-semibold mb-4 text-[#006400]">Displaying Zone: {hub?.zone.name}</div>
            )}
            <Flex className="w-full max-w-[600px] mx-auto" gap={10}>
              <Button type="primary" className="w-full max-w-[300px] mx-auto" onClick={() => handleSubmit()}>
                Next
              </Button>
            </Flex>
          </>
        ) : (
          <Flex justify="center" className="py-4">
            <Result
              status="success"
              title="Update Hub Location"
              subTitle={createdData && <>Hub name: {createdData.name}</>}
              extra={[
                <Button key="back" onClick={() => navigate('/hubs')}>
                  Back to Hubs Management
                </Button>,
                <Button type="primary" key="view" onClick={() => navigate(`/hubs/${createdData?.id}`)}>
                  View Updated Hub
                </Button>,
              ]}
            />
          </Flex>
        )}
      </Card>
    </ContentWrapperDark>
  );
};

export default HubUpdateLocation;
