import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../components/map/DraggableMarker';
import { ParkResponse, AttractionResponse, getAttractionById, getParkById, updateAttractionDetails } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { COLORS } from '../../config/colors';
import { FaTicketAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { LatLng } from 'leaflet';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Button, Card, message, Popconfirm } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';

export interface AdjustLatLngInterface {
  lat?: number | null;
  lng?: number | null;
}

const AttractionEditMap = () => {
  const { id } = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [polygon, setPolygon] = useState<LatLng[][]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const attractionRes = await getAttractionById(id);
        if (attractionRes.status === 200) {
          const attractionData = attractionRes.data;
          setAttraction(attractionData);
          setLat(attractionData.lat);
          setLng(attractionData.lng);

          try {
            const parkRes = await getParkById(attractionData.parkId);
            if (parkRes.status === 200) {
              const parkData = parkRes.data;
              setPark(parkData);
              setPolygon(parkData.geom.coordinates);
            }
          } catch (error) {
            console.error('Error fetching park details:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching attraction details:', error);
      }
    };
    fetchData();
  }, [id]);

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
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <PolygonFitBounds geom={park?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={park?.name} />
              <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />
            </MapContainer>
          </div>
          {park?.geom?.coordinates && park?.geom.coordinates.length > 0 && (
            <div className="font-semibold mb-4 text-[#006400]">Displaying Park: {park.name}</div>
          )}
        </>
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
