import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ContentWrapperDark, ImageInput, useAuth } from '@lepark/common-ui';
import {
  AttractionResponse,
  FacilityResponse,
  getAttractionsByParkId,
  getFacilitiesByParkId,
  getOccurrencesByParkId,
  getZonesByParkId,
  OccurrenceResponse,
  ParkResponse,
  StaffResponse,
  StaffType,
  updatePark,
  ZoneResponse,
} from '@lepark/data-access';
import { Button, Card, Checkbox, message, Popconfirm, Space, Tooltip } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import node_image from '../../assets/mapFeatureManager/line.png';
import polygon_image from '../../assets/mapFeatureManager/polygon.png';
import edit_image from '../../assets/mapFeatureManager/edit.png';
import MapFeatureManagerEdit from '../../components/map/MapFeatureManagerEdit';
import { LatLng } from 'leaflet';
import {
  latLngArrayToPolygon,
  pointsAreWithinPolygon,
  polygonIsWithin,
  polygonIsWithinPark,
} from '../../components/map/functions/functions';
import { useRestrictPark } from '../../hooks/Parks/useRestrictPark';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import { COLORS } from '../../config/colors';
import { TbTicket, TbTree } from 'react-icons/tb';
import PictureMarker from '../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import FacilityPictureMarker from '../../components/map/FacilityPictureMarker';
import FitBounds from '../../components/map/FitBounds';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const ParkEditMap = () => {
  const { id } = useParams();
  const { park, loading } = useRestrictPark(id);
  const { user } = useAuth<StaffResponse>();
  const [createdData, setCreatedData] = useState<ParkResponse>();
  const [polygon, setPolygon] = useState<LatLng[][]>([]); // original polygon
  const [editPolygon, setEditPolygon] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const [parkZones, setParkZones] = useState<ZoneResponse[]>();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);
  const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);

  const [showParkZones, setShowParkZones] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);

  useEffect(() => {
    if (park && park.geom && park.geom.coordinates) {
      setPolygon(park.geom.coordinates);
    }
    if (park) {
      fetchParkZonesData();
      fetchOccurrences();
      fetchAttractions();
      fetchFacilities();
    }
  }, [park]);

  const fetchParkZonesData = async () => {
    if (!park?.id) return;
    try {
      const parkZonesRes = await getZonesByParkId(park.id);
      if (parkZonesRes.status === 200) {
        const parkZonesData = parkZonesRes.data;
        setParkZones(parkZonesData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchOccurrences = async () => {
    if (!park?.id) return;
    try {
      const occurrenceRes = await getOccurrencesByParkId(park.id);
      if (occurrenceRes.status === 200) {
        const occurrenceData = occurrenceRes.data;
        setOccurrences(occurrenceData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchAttractions = async () => {
    if (!park?.id) return;
    try {
      const attractionsRes = await getAttractionsByParkId(park.id);
      if (attractionsRes.status === 200) {
        const attractionsData = attractionsRes.data;
        setAttractions(attractionsData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const fetchFacilities = async () => {
    if (!park?.id) return;
    try {
      const occurrenceRes = await getFacilitiesByParkId(park.id);
      if (occurrenceRes.status === 200) {
        const occurrenceData = occurrenceRes.data;
        setFacilities(occurrenceData);
      }
    } catch (error) {
      // do nothing
    }
  };

  const handleSubmit = async () => {
    if (!park) return;
    setSubmitLoading(true);
    try {
      const finalData: any = {};

      if (editPolygon && editPolygon[0] && editPolygon[0][0]) {
        const polygonData = latLngArrayToPolygon(editPolygon[0][0]);
        finalData.geom = polygonData;
      } else {
        throw new Error('Please draw Park boundaries on the map.');
      }

      // Boundary validation
      const allZonesWithin = parkZones?.every((zone) => polygonIsWithinPark(zone.geom.coordinates?.[0], editPolygon[0][0]));
      const allAttractionsWithin = pointsAreWithinPolygon(
        editPolygon[0][0],
        attractions?.map((attraction) => ({ lat: attraction.lat, lng: attraction.lng })),
      );
      const validFacilities = facilities
        ?.filter((facility) => facility.lat && facility.long && facility.lat !== undefined && facility.long !== undefined)
        .map((facility) => ({ lat: facility.lat as number, lng: facility.long as number }));
      const allFacilitiesWithin = pointsAreWithinPolygon(editPolygon[0][0], validFacilities);

      if (!allZonesWithin) {
        messageApi.open({
          type: 'error',
          content: 'Some Zone(s) fall outside the Park boundaries.',
        });
      }
      if (!allFacilitiesWithin) {
        messageApi.open({
          type: 'error',
          content: 'Some Facility/Facilities fall outside the Park boundaries.',
        });
      }
      if (!allAttractionsWithin) {
        messageApi.open({
          type: 'error',
          content: 'Some Attraction(s) fall outside the Park boundaries.',
        });
      }
      if (!allZonesWithin || !allFacilitiesWithin || !allAttractionsWithin) {
        setSubmitLoading(false);
        return;
      }

      const response = await updatePark(park.id, finalData);
      setSubmitLoading(false);
      if (response.status === 200) {
        setCreatedData(response.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Park Boundaries.  Redirecting to Park details page...',
        });
        setTimeout(() => {
          navigate(`/park/${park.id}`);
        }, 1000);
      }
    } catch (error) {
      setSubmitLoading(false);
      if (error instanceof Error) {
        if (error.message === 'A park with this name already exists') {
          messageApi.open({
            type: 'error',
            content: 'A park with this name already exists. Please choose a different name.',
          });
        } else {
          messageApi.open({
            type: 'error',
            content: error.message || 'Unable to save changes to Park. Please try again later.',
          });
        }
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the park.',
        });
      }
    }
  };

  const breadcrumbItems = [
    ...(user?.role === StaffType.SUPERADMIN
      ? [
          {
            title: 'Park Management',
            pathKey: '/park',
            isMain: true,
          },
        ]
      : []),
    {
      title: park?.name ? park?.name : 'Details',
      pathKey: `/park/${park?.id}`,
      ...(user?.role !== StaffType.SUPERADMIN && { isMain: true }),
    },
    {
      title: 'Edit Boundaries',
      pathKey: `/park/${park?.id}/edit-map`,
      isCurrent: true,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!park) {
    return <div>Park not found or access denied.</div>;
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
            <Space size={16}>
              <div className="font-semibold">Display:</div>

              {parkZones && parkZones.length > 0 ? (
                <Checkbox
                  onChange={(e) => setShowParkZones(e.target.checked)}
                  checked={showParkZones}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Zones
                </Checkbox>
              ) : (
                <Tooltip title="No Zones available">
                  <Checkbox disabled={true} className="border-gray-200 border-[1px] px-4 py-1 rounded-full">
                    Zones
                  </Checkbox>
                </Tooltip>
              )}
              {occurrences && occurrences.length > 0 ? (
                <Checkbox
                  onChange={(e) => setShowOccurrences(e.target.checked)}
                  checked={showOccurrences}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Occurrences
                </Checkbox>
              ) : (
                <Tooltip title="No Occurrences available">
                  <Checkbox disabled={true} className="border-gray-200 border-[1px] px-4 py-1 rounded-full">
                    Occurrences
                  </Checkbox>
                </Tooltip>
              )}
              {attractions && attractions.length > 0 ? (
                <Checkbox
                  onChange={(e) => setShowAttractions(e.target.checked)}
                  checked={showAttractions}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Attractions
                </Checkbox>
              ) : (
                <Tooltip title="No Attractions available">
                  <Checkbox disabled={true} className="border-gray-200 border-[1px] px-4 py-1 rounded-full">
                    Attractions
                  </Checkbox>
                </Tooltip>
              )}
              {facilities && facilities.length > 0 ? (
                <Checkbox
                  onChange={(e) => setShowFacilities(e.target.checked)}
                  checked={showFacilities}
                  className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
                >
                  Facilities
                </Checkbox>
              ) : (
                <Tooltip title="No Facilities available">
                  <Checkbox disabled={true} className="border-gray-200 border-[1px] px-4 py-1 rounded-full">
                    Facilities
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
              <FitBounds geom={park.geom} />

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

              {showOccurrences &&
                occurrences &&
                occurrences.map((occurrence) => (
                  <PictureMarker
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

              {showAttractions &&
                attractions &&
                attractions.map((occurrence) => (
                  <PictureMarker
                    id={occurrence.id}
                    entityType="ATTRACTION"
                    circleWidth={30}
                    lat={occurrence.lat}
                    lng={occurrence.lng}
                    backgroundColor={COLORS.mustard[300]}
                    icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                    tooltipLabel={occurrence.title}
                  />
                ))}

              {showFacilities &&
                facilities &&
                facilities.map(
                  (facility) =>
                    facility.lat &&
                    facility.long && (
                      <FacilityPictureMarker
                        id={facility.id}
                        circleWidth={38}
                        lat={facility.lat}
                        lng={facility.long}
                        innerBackgroundColor={COLORS.sky[400]}
                        tooltipLabel={facility.name}
                        facilityType={facility.facilityType}
                      />
                    ),
                )}

              <MapFeatureManagerEdit
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
          <Popconfirm title="All changes will be lost." onConfirm={() => navigate(`/park/${park?.id}`)}>
            <Button>Cancel</Button>
          </Popconfirm>

          <Button type="primary" onClick={handleSubmit} disabled={submitLoading}>
            Save Changes
          </Button>
        </div>
      </Card>
    </ContentWrapperDark>
  );
};

export default ParkEditMap;
