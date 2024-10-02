import { ContentWrapperDark, SIDEBAR_WIDTH, useAuth } from '@lepark/common-ui';
import { Polygon, GeoJSON as PolygonGeoJson, useMap } from 'react-leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../Occurrence/OccurrenceCreate';
import { OccurrenceResponse, StaffResponse, StaffType, updateOccurrenceDetails, ZoneResponse } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { getCentroidOfGeom } from '../../components/map/functions/functions';
import { COLORS } from '../../config/colors';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, notification, Select, Form, Popconfirm, Button, message, Typography } from 'antd';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { useRestrictOccurrence } from '../../hooks/Occurrences/useRestrictOccurrence';
import PageHeader2 from '../../components/main/PageHeader2';
const { Text } = Typography;

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  formValues: any;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
  zones: ZoneResponse[];
}

const OccurrenceEditMap = () => {
  const { user } = useAuth<StaffResponse>();
  const { occurrenceId } = useParams();
  const { zones, loading } = useFetchZones();
  const [createdData, setCreatedData] = useState<OccurrenceResponse>();
  const { occurrence } = useRestrictOccurrence(occurrenceId);
  const [selectedZone, setSelectedZone] = useState<ZoneResponse>();
  const notificationShown = useRef(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const zoneId = Form.useWatch('zoneId', form);

  // Map Values
  const [lat, setLat] = useState(occurrence?.lat);
  const [lng, setLng] = useState(occurrence?.lng);

  // Set initial Zone, Lat Lng
  useEffect(() => {
    if (occurrence) {
      form.setFieldsValue({ zoneId: occurrence.zoneId } );
      adjustLatLng({ lat: occurrence.lat, lng: occurrence.lng });
    }
  }, [occurrence, form]);

  // Adjst Zone
  useEffect(() => {
    if (zones?.length > 0 && zoneId) {
      const selectedZone = zones.find((z) => z.id === zoneId);
      setSelectedZone(selectedZone);
    }
  }, [zones, zoneId]);

  const handleSubmit = async () => {
    if (!occurrence) return;
    try {
      const finalData: any = {}
      if (lat) {
        finalData.lat = lat;
      }
      if (lng) {
        finalData.lng = lng;
      }
      if (zoneId) {
        finalData.zoneId = zoneId;
      }
      
      const occurrenceRes = await updateOccurrenceDetails(occurrence.id, finalData);
      if (occurrenceRes.status === 200) {
        setCreatedData(occurrenceRes.data);
        messageApi.open({
          type: 'success',
          content: 'Saved changes to Occurrence. Redirecting to Occurrence details page...',
        });
        // Add a 3-second delay before navigating
        setTimeout(() => {
          navigate(`/occurrences/${occurrence.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating Occurrence', error);
      messageApi.open({
        type: 'error',
        content: 'Unable to update Occurrence. Please try again later.',
      });
    }
  };

  // useEffect(() => {
  //   if (zones?.length > 0 ) {
  //     const selectedZone = zones.find((z) => z.id === formValues.zoneId);
  //     setSelectedZone(selectedZone);
  //   }
  // }, [zones, formValues.zoneId]);

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
      title: 'Occurrence Management',
      pathKey: '/occurrences',
      isMain: true,
    },
    {
      title: occurrence?.title ? occurrence?.title : 'Details',
      pathKey: `/occurrences/${occurrence?.id}`,
    },
    {
      title: 'Edit Location',
      pathKey: `/occurrences/${occurrence?.id}/edit-location`,
      isCurrent: true,
    },
  ];

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <Form
          form={form}
          className="max-w-[600px]"
        >
          <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
            <Select
              placeholder="Select a Zone that this Occurrence belongs to"
              options={zones?.map((zone) => ({ key: zone.id, value: zone.id, label: zone.name }))}
            />
          </Form.Item>
        </Form>
        <div className="mb-2">
          <Text className='text-error'>{"* "}</Text>
          Drag the Marker around within the boundaries of your selected Zone:
        </div>
        <div
          style={{
            height: '45vh',
            zIndex: 1,
          }}
          className="rounded-xl overflow-hidden"
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

            <PolygonFitBounds geom={selectedZone?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={selectedZone?.name} />
            {lat && lng && <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />}
          </MapContainer>
        </div>
        {selectedZone?.geom?.coordinates && selectedZone?.geom.coordinates.length > 0 && (
          <div className="font-semibold mb-4 text-[#006400]">Displaying Zone: {selectedZone.name}</div>
        )}
        <div className='flex justify-center gap-2'>
          <Popconfirm title="All changes will be lost." onConfirm={() => navigate(`/occurrences/${occurrence?.id}`)}>
            <Button>
              Cancel
            </Button>
          </Popconfirm>
          
          <Button type="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </Card>
    </ContentWrapperDark>
  );
};

export default OccurrenceEditMap;
