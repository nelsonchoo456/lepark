import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, message, Checkbox, Space, Button, Popconfirm, Tooltip } from 'antd';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import {
  DecarbonizationAreaResponse,
  getDecarbonizationAreaById,
  updateDecarbonizationArea,
  getParkById,
  ParkResponse,
  getDecarbonizationAreasByParkId,
  getOccurrencesByParkId,
  OccurrenceResponse,
  getZonesByParkId,
  ZoneResponse,
} from '@lepark/data-access';
import { latLngArrayToPolygon, polygonHasOverlap, polygonIsWithin } from '../../components/map/functions/functions';
import { StaffType } from '@lepark/data-access';
import PageHeader2 from '../../components/main/PageHeader2';
import { ContentWrapperDark, useAuth } from '@lepark/common-ui';
import { LatLng } from 'leaflet';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';
import { useRestrictDecarbonizationArea } from '../../hooks/DecarbonizationArea/useRestrictDecarbonizationArea';
import MapFeatureManagerEdit from '../../components/map/MapFeatureManagerEdit';
import { COLORS } from '../../config/colors';
import node_image from '../../assets/mapFeatureManager/line.png';
import polygon_image from '../../assets/mapFeatureManager/polygon.png';
import edit_image from '../../assets/mapFeatureManager/edit.png';
import PictureMarker from '../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { TbTree } from 'react-icons/tb';

const parseGeom = (geom: string) => {
  //console.log('Parsing geom:', geom); // Log the geom string

  // Check if the string is a GeoJSON format
  if (geom.startsWith('SRID=4326;')) {
    const wktString = geom.substring(10); // Remove the 'SRID=4326;' prefix

    // Handle WKT format
    const match = wktString.match(/POLYGON\s*\(\(([^)]+)\)\)/);
    if (!match) {
      throw new Error(`Invalid WKT format: ${wktString}`);
    }

    const coordinates = match[1].split(',').map((coord) => {
      const [lng, lat] = coord.trim().split(' ').map(Number);
      return [lng, lat];
    });

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  }

  // If it's not WKT, try to parse it as GeoJSON
  try {
    const geoJson = JSON.parse(geom);
    return geoJson;
  } catch (error) {
    throw new Error(`Invalid GeoJSON format: ${geom}`);
  }
};

const DecarbonizationAreaEditMap = () => {
  const { id } = useParams();
  const { decarbonizationArea, loading: areaLoading } = useRestrictDecarbonizationArea(id);
  const { park, loading: parkLoading } = useRestrictPark(decarbonizationArea?.parkId?.toString(), { disableNavigation: true });
  const [createdData, setCreatedData] = useState<DecarbonizationAreaResponse>();
  const [parkDecarbAreas, setParkDecarbAreas] = useState<DecarbonizationAreaResponse[]>();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  const [polygon, setPolygon] = useState<LatLng[][]>([]); // original polygon
  const [editPolygon, setEditPolygon] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [zones, setZones] = useState<ZoneResponse[]>();

  const [showPark, setShowPark] = useState<boolean>(true);
  const [showParkDecarbAreas, setShowParkDecarbAreas] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showZones, setShowZones] = useState<boolean>(false);

  useEffect(() => {
    if (!decarbonizationArea) return;
    fetchParkDecarbAreasData();
    const decarbonizationAreaGeom = parseGeom(decarbonizationArea.geom);
    fetchOccurrencesData();
    setPolygon(decarbonizationAreaGeom.coordinates);
    fetchZones();
  }, [decarbonizationArea]);

  const fetchParkDecarbAreasData = async () => {
    if (!decarbonizationArea?.parkId) return;
    try {
      const parkDecarbAreasRes = await getDecarbonizationAreasByParkId(decarbonizationArea.parkId);
      if (parkDecarbAreasRes.status === 200) {
        let parkDecarbAreasData = parkDecarbAreasRes.data;
        parkDecarbAreasData = parkDecarbAreasData.filter((area) => area.id.toString() !== id);
        setParkDecarbAreas(parkDecarbAreasData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchOccurrencesData = async () => {
    if (!decarbonizationArea?.parkId) return;
    try {
      const occurrencesRes = await getOccurrencesByParkId(decarbonizationArea.parkId);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData);
        console.log('Occurrences:', occurrencesData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchZones = async () => {
    if (!decarbonizationArea?.parkId) return;
    const zonesRes = await getZonesByParkId(decarbonizationArea?.parkId);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  };

  const handleSubmit = async () => {
    if (!decarbonizationArea) return;
    try {
      const finalData: any = {};

      if (editPolygon && editPolygon[0] && editPolygon[0][0]) {
        const polygonData = latLngArrayToPolygon(editPolygon[0][0]);
        finalData.geom = polygonData;
      } else {
        throw new Error('Please draw Decarbonization Area boundaries on the map.');
      }

      // Boundary validation
      const hasOverlap = polygonHasOverlap(
        editPolygon[0][0],
        parkDecarbAreas?.map((area) => parseGeom(area.geom).coordinates?.[0]),
      );
      const isWithinPark = polygonIsWithin(editPolygon[0][0], park?.geom?.coordinates?.[0]);
      if (hasOverlap) {
        messageApi.open({
          type: 'error',
          content: 'The Decarbonization Area boundaries overlap with other Decarbonization Area(s).',
        });
      }
      if (!isWithinPark) {
        messageApi.open({
          type: 'error',
          content: 'The Decarbonization Area boundaries are not within the Park.',
        });
      }
      if (hasOverlap || !isWithinPark) {
        return;
      }

      const response = await updateDecarbonizationArea(decarbonizationArea.id, finalData);
      if (response.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Decarbonization Area Boundaries.  Redirecting to Decarbonization Area details page...',
        });
        setCreatedData(response.data);
        setTimeout(() => {
          navigate(`/decarbonization-area/${decarbonizationArea.id}`);
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.open({
          type: 'error',
          content: error.message,
        });
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred.',
        });
      }
    }
  };

  const breadcrumbItems = [
    {
      title: 'Decarbonization Area Management',
      pathKey: '/decarbonization-area',
      isMain: true,
    },
    {
      title: decarbonizationArea?.name ? decarbonizationArea?.name : 'Details',
      pathKey: `/decarbonization-area/${decarbonizationArea?.id}`,
    },
    {
      title: 'Edit Boundaries',
      pathKey: `/decarbonization-area/${decarbonizationArea?.id}/edit-map`,
      isCurrent: true,
    },
  ];

  if (areaLoading) {
    return <div>Loading decarbonization area...</div>;
  }

  if (!decarbonizationArea) {
    return <div>Decarbonization Area not found or access denied</div>;
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
                <Checkbox
                  onChange={(e) => setShowPark(e.target.checked)}
                  checked={showPark}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  {park.name} (Park)
                </Checkbox>
              )}
              {zones && zones.length > 0 && (
                <Checkbox
                  onChange={(e) => setShowZones(e.target.checked)}
                  checked={showZones}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Zones
                </Checkbox>
              )}
              {parkDecarbAreas && parkDecarbAreas.length > 0 && (
                <Checkbox
                  onChange={(e) => setShowParkDecarbAreas(e.target.checked)}
                  checked={showParkDecarbAreas}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Other Decarbonization Areas
                </Checkbox>
              )}
              {occurrences && (
                <Checkbox
                  onChange={(e) => setShowOccurrences(e.target.checked)}
                  checked={showOccurrences}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Occurrences
                </Checkbox>
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
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {showPark && (
                <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={park?.name} color="transparent" />
              )}
              <PolygonFitBounds
                geom={parseGeom(decarbonizationArea?.geom)}
                polygonFields={{ fillOpacity: 0.9 }}
                polygonLabel={decarbonizationArea?.name}
              />
              {showParkDecarbAreas &&
                parkDecarbAreas?.map((area) => (
                  <PolygonWithLabel
                    key={area.id}
                    entityId={area.id}
                    geom={parseGeom(area.geom)}
                    polygonLabel={area.name}
                    color="green"
                    fillColor={'transparent'}
                    labelFields={{ color: 'green', textShadow: 'none' }}
                  />
                ))}
              {showZones &&
                zones &&
                zones.map((zone) => (
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
                    color={COLORS.green[600]}
                    fillColor={'transparent'}
                    labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
                  />
                ))}
              {showOccurrences &&
                occurrences &&
                occurrences.map((occurrence) => (
                  <PictureMarker
                    key={occurrence.id}
                    id={occurrence.id}
                    entityType="OCCURRENCE"
                    circleWidth={30}
                    lat={occurrence.lat}
                    lng={occurrence.lng}
                    backgroundColor={COLORS.green[300]}
                    icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                    tooltipLabel={occurrence.title}
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
          <Popconfirm title="All changes will be lost." onConfirm={() => navigate(`/decarbonization-area/${decarbonizationArea?.id}`)}>
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

export default DecarbonizationAreaEditMap;
