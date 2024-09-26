import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import { createPark, getParkById, getZoneById, getZonesByParkId, ParkResponse, StaffResponse, StaffType, StringIdxSig, updatePark, updateZone, ZoneResponse } from '@lepark/data-access';
import { Button, Card, Checkbox, Form, message, notification, Popconfirm, Space, Tooltip } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import node_image from '../../assets/mapFeatureManager/line.png';
import polygon_image from '../../assets/mapFeatureManager/polygon.png';
import edit_image from '../../assets/mapFeatureManager/edit.png';
import MapFeatureManagerEdit from '../../components/map/MapFeatureManagerEdit';
import { LatLng } from 'leaflet';
import { latLngArrayToPolygon, polygonHasOverlap, polygonIsWithin } from '../../components/map/functions/functions';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import { TbTree } from 'react-icons/tb';
import { COLORS } from '../../config/colors';
import { useRestrictZone } from '../../hooks/Zones/useRestrictZone';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const ZoneEditMap = () => {
  const { id } = useParams();
  const { zone, loading: zoneLoading } = useRestrictZone(id);
  const { park, loading: parkLoading } = useRestrictPark(zone?.parkId?.toString(), { disableNavigation: true });
  const [createdData, setCreatedData] = useState<ZoneResponse>();
  const [parkZones, setParkZones] = useState<ZoneResponse[]>();
  const [polygon, setPolygon] = useState<LatLng[][]>([]); // original polygon
  const [editPolygon, setEditPolygon] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  const [showPark, setShowPark] = useState<boolean>(true);
  const [showParkZones, setShowParkZones] = useState<boolean>(false);

  useEffect(() => {
    if (!zone) return;
    fetchParkZonesData();
    setPolygon(zone.geom.coordinates);
  }, [zone])

  const fetchParkZonesData = async () => {
    if (!zone?.parkId) return;
    try {
      const parkZonesRes = await getZonesByParkId(zone.parkId);
      if (parkZonesRes.status === 200) {
        let parkZonesData = parkZonesRes.data;
        parkZonesData = parkZonesData.filter((zone) => zone.id.toString() !== id)
        setParkZones(parkZonesData)
      }
    } catch (error) {
      // do nothing
    }
  };

  const handleSubmit = async () => {
    if (!zone) return;
    try {
      const finalData: any = {};

      if (editPolygon && editPolygon[0] && editPolygon[0][0]) {
        const polygonData = latLngArrayToPolygon(editPolygon[0][0]);
        finalData.geom = polygonData;
      } else {
        throw new Error('Please draw Zone boundaries on the map.');
      }

      const hasOverlap = polygonHasOverlap(editPolygon[0][0], parkZones?.map((z) => z?.geom?.coordinates?.[0]));
      const isWithinPark = polygonIsWithin(editPolygon[0][0], park?.geom?.coordinates?.[0]);
      if (hasOverlap) {
        messageApi.open({
          type: 'error',
          content: 'The Zone boundaries overlaps with other Zone(s).',
        });
      }
      if (!isWithinPark) {
        messageApi.open({
          type: 'error',
          content: 'The Zone boundaries is not within the Park.',
        });
      }
      if (hasOverlap || !isWithinPark) {
        return;
      }

      const response = await updateZone(zone.id, finalData);
      if (response.status === 200) {
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Zone Boundaries.  Redirecting to Zone details page...',
        });
        setTimeout(() => {
          navigate(`/zone/${zone.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'A zone with this name already exists') {
          messageApi.open({
            type: 'error',
            content: 'A zone with this name already exists. Please choose a different name.',
          });
        } else {
          messageApi.open({
            type: 'error',
            content: error.message || 'Unable to save changes to Zone. Please try again later.',
          });
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the zone.',
        });
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Zone Management',
      pathKey: '/zone',
      isMain: true,
    },
    {
      title: zone?.name ? zone?.name : 'Details',
      pathKey: `/zone/${zone?.id}`,
    },
    {
      title: 'Edit Boundaries',
      pathKey: `/zone/${zone?.id}/edit-map`,
      isCurrent: true,
    },
  ];

  if (zoneLoading) {
    return <div>Loading zone...</div>;
  }

  if (!zone) {
    return <div>Zone not found or access denied</div>;
  }

  if (parkLoading) {
    return <div>Loading park...</div>;
  }

  if (!park) {
    return <div>Park not found or access denied</div>;
  }

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <>
          <div className="">
            <div className="font-semibold">Instructions: </div>
            <Space>
              <img src={node_image} alt="node" height={'16px'} width={'16px'} /> - Draw Paths with the line tool
            </Space>
            <br />
            <Space>
              <img src={polygon_image} alt="node" height={'16px'} width={'16px'} /> - Draw Boundaries with the polygon tool
            </Space>
            <br />
            <Space>
              <img src={edit_image} alt="polygon-edit" height={'16px'} width={'16px'} /> - Edit Paths and Boundaries
            </Space>
          </div>

          <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mt-4">
            <Space size={30}>
              <div className="font-semibold">Display:</div>
              {park && (
                <Checkbox onChange={(e) => setShowPark(e.target.checked)} checked={showPark}>
                  {park.name} (Park)
                </Checkbox>
              )}
              {parkZones && parkZones.length > 0 ? (
                <Checkbox onChange={(e) => setShowParkZones(e.target.checked)} checked={showParkZones}>
                  Other Zones in the Park
                </Checkbox>
              ) : (
                <Tooltip title="No other Zones in this Park">
                  <Checkbox onChange={(e) => setShowParkZones(e.target.checked)} checked={showParkZones} disabled>
                    Other Zones in the Park
                  </Checkbox>
                </Tooltip>
              )}
            </Space>
          </Card>

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
              style={{ height: '60vh', width: '100%' }}
              key="park-create"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {showPark && (
                <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.4 }} polygonLabel={park?.name} color="transparent" />
              )}
              {showParkZones &&
                parkZones?.map((zone) => (
                  <PolygonWithLabel
                    key={zone.id}
                    entityId={zone.id}
                    geom={zone.geom}
                    polygonLabel={
                      <div className="flex items-center gap-2">
                        <TbTree className="text-xl" />
                        {zone.name}
                      </div>
                    }
                    color={COLORS.green[500]}
                    fillColor={'transparent'}
                    labelFields={{ color: COLORS.green[600], textShadow: 'none' }}
                  />
                ))}
              <MapFeatureManagerEdit
                color={COLORS.green[800]}
                polygon={polygon}
                setPolygon={setPolygon}
                editPolygon={editPolygon}
                setEditPolygon={setEditPolygon}
                lines={lines}
                setLines={setLines}
              />
            </MapContainer>
          </div>
        </>
        <div className="flex justify-center gap-2">
          <Popconfirm title="All changes will be lost." onConfirm={() => navigate(`/zone/${zone?.id}`)}>
            <Button>Cancel</Button>
          </Popconfirm>

          <Button type="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </Card>
    </ContentWrapperDark>
  );
};

export default ZoneEditMap;
