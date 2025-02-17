import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../components/map/DraggableMarker';
import { ParkResponse, AttractionResponse, getAttractionById, getParkById, updateAttractionDetails, getZonesByParkId, ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { COLORS } from '../../config/colors';
import { FaTicketAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { LatLng } from 'leaflet';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Button, Card, Flex, Input, message, Popconfirm } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import { useRestrictAttractions } from '../../hooks/Attractions/useRestrictAttractions';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import { TbTree } from 'react-icons/tb';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const AttractionEditMap = () => {
  const { id } = useParams<{ id: string }>();
  const { attraction, park, loading } = useRestrictAttractions(id);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const [selectedParkZones, setSelectedParkZones] = useState<ZoneResponse[]>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      if (!attraction) return;
      if (!park) return;

      setLat(attraction.lat);
      setLng(attraction.lng);

      setPolygon(park.geom.coordinates);

      const fetchZones = async () => {
        const zonesRes = await getZonesByParkId(park.id);
        if (zonesRes.status === 200) {
          const zonesData = zonesRes.data;
          setSelectedParkZones(zonesData);
        }
      }
      fetchZones();
    };

    fetchData();
  }, [id, attraction, park]);

  const adjustLatLng = ({ lat, lng }: AdjustLatLngInterface) => {
    if (lat) {
      setLat(lat);
    }
    if (lng) {
      setLng(lng);
    }
  };

  const handleSubmit = async () => {
    if (!attraction) return;
    try {
      const finalData: any = {};
      if (lat) {
        finalData.lat = lat;
      }
      if (lng) {
        finalData.lng = lng;
      }

      const attractionRes = await updateAttractionDetails(attraction.id, finalData);
      if (attractionRes.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Attraction Location. Redirecting to Attraction details page...',
        });
        setTimeout(() => {
          navigate(`/attraction/${attraction.id}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('An attraction with this title already exists in the park')) {
        messageApi.error('An attraction with this title already exists in the park.');
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the attraction.',
        });
      }
    }
  };

  if (!attraction || lat === null || lng === null) {
    return <div>Loading Attraction map...</div>;
  }

  const breadcrumbItems = [
    {
      title: 'Attraction Management',
      pathKey: '/attraction',
      isMain: true,
    },
    {
      title: attraction?.title ? attraction?.title : 'Details',
      pathKey: `/attraction/${attraction?.id}`,
    },
    {
      title: 'Edit Location',
      pathKey: `/attraction/${attraction?.id}/edit-location`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <>
          <div className="">
            <div className="font-semibold">Instructions: </div>
            Drag the Marker to adjust the location of the attraction within the park boundaries.
          </div>
          <div
            style={{
              height: '45vh',
              zIndex: 1,
            }}
            className="py-4 rounded overflow-hidden"
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

              <PolygonFitBounds geom={park?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={park?.name} />
              {selectedParkZones && selectedParkZones?.length > 0 &&
                selectedParkZones
                  .map((zone) => (
                    <PolygonWithLabel key={zone.id} entityId={zone.id} geom={zone.geom} polygonLabel={<div className='flex items-center gap-2'><TbTree className='text-xl'/>{zone.name}</div>} color={COLORS.green[600]} fillColor={"transparent"} labelFields={{ color: COLORS.green[800], textShadow: "none" }}/>
                ))}
              <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />
            </MapContainer>
          </div>
          {park?.geom?.coordinates && park?.geom.coordinates.length > 0 && (
            <div className="font-semibold mb-4 text-[#006400]">Displaying Park: {park.name}</div>
          )}
        </>
        <Flex className="w-full max-w-[600px] mx-auto pb-4" gap={10}>
          <div className="flex-1">
            Latitude: <Input value={lat} />
          </div>
          <div className="flex-1">
            Longitude: <Input value={lng} />
          </div>
        </Flex>
        <div className="flex justify-center gap-2">
          <Popconfirm title="All changes will be lost." onConfirm={() => navigate(`/attraction/${attraction?.id}`)}>
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

export default AttractionEditMap;
