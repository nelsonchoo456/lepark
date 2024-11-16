import { MapContainer, TileLayer } from 'react-leaflet';
import {
  FacilityResponse,
  getAllSensorReadingsByParkIdAndSensorType,
  getAttractionsByParkId,
  getFacilitiesByParkId,
  getParkById,
  getSensorsByParkId,
  getZonesByParkId,
  ParkResponse,
  SensorResponse,
  SensorStatusEnum,
  updateAttractionDetails,
  updateFacilityCameraSensor,
  ZoneResponse,
} from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../IotMap/components/PolygonWithLabel';
import { TbBuildingEstate, TbTree } from 'react-icons/tb';
import { COLORS } from '../../config/colors';
import { SensorTypeEnum } from '@prisma/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useRestrictFacilities } from '../../hooks/Facilities/useRestrictFacilities';
import { ContentWrapperDark } from '@lepark/common-ui';
import { Card, message, Select, Tooltip, Form, Flex, Button, Tag } from 'antd';
import PageHeader2 from '../../components/main/PageHeader2';
import PictureMarker from '../../components/map/PictureMarker';
import { MdOutlinePhotoCamera } from 'react-icons/md';
import * as turf from '@turf/turf';
import { useRestrictAttractions } from '../../hooks/Attractions/useRestrictAttractions';

const AttractionAssignCamera = () => {
  const { attractionId } = useParams<{ attractionId: string }>();
  const { attraction, park, loading } = useRestrictAttractions(attractionId);
  const [cameraSensors, setCameraSensors] = useState<(SensorResponse & {distance?: number, cameraFacilityAttractionName?: string })[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorResponse>();
  const [selectedParkZones, setSelectedParkZones] = useState<ZoneResponse[]>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const formSensorId = Form.useWatch('cameraSensorId', form);

  useEffect(() => {
    if (attraction) {
      fetchCameraSensors(attraction.parkId);
    }
  }, [attraction]);

  const fetchCameraSensors = async (parkId: number) => {
    if (!attraction) return;
    try {
      const facilitiesRes = await getFacilitiesByParkId(parkId);
      const attractionsRes = await getAttractionsByParkId(parkId);

      const cameraSensorsRes = await getSensorsByParkId(parkId);
      if (cameraSensorsRes.status === 200) {
        const facilitiesWithCameraSensors = facilitiesRes.data.filter((f) => f.cameraSensorId);
        const attractionsWithCameraSensors = attractionsRes.data.filter((f) => f.cameraSensorId);

        const sensorsWithDistance = cameraSensorsRes.data
        ?.filter((s) => s.sensorType === SensorTypeEnum.CAMERA && s.sensorStatus === SensorStatusEnum.ACTIVE)
        .map((s) => {
          const linkedFacility = facilitiesWithCameraSensors.find((f) => f.cameraSensorId === s.id);
          const linkedAttraction = attractionsWithCameraSensors.find((a) => a.cameraSensorId === s.id);

          // Calculate distance if lat/long are available for both sensor and attraction
          let distance;
          if (s.lat && s.long && attraction.lat && attraction.lng) {
            distance = turf.distance(
              turf.point([attraction.lng, attraction.lat]),
              turf.point([s.long, s.lat]),
              { units: 'meters' }
            );
          }
          
          // Return sensor with distance and cameraFacilityAttractionName if linkedFacility is found
          return {
            ...s,
            distance: distance ? Math.round(distance) : undefined,
            cameraFacilityAttractionName: linkedFacility ? linkedFacility.name : linkedAttraction ? linkedAttraction.title : undefined
          };
        });
      setCameraSensors(sensorsWithDistance);
      }
    } catch (e) {
      setCameraSensors([]);
    }
  };

  const handleSubmit = async () => {
    if (!attraction || !formSensorId) return;
    try {
      const response = await updateAttractionDetails(attraction.id, { cameraSensorId: formSensorId });
      if (response.status === 200) {
        messageApi.success('Saved changes to Attraction Camera Sensor. Redirecting to Attraction details page...');
        setTimeout(() => navigate(`/attraction/${attraction.id}`), 1000);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Camera Sensor not found')) {
        messageApi.error('Camera Sensor not found');
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the attraction.',
        });
      }
    }
  }

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
    {
      title: 'Assign Camera',
      pathKey: `/attraction/${attraction?.id}/assign-camera`,
      isCurrent: true,
    },
  ];

  const handleSelectSensor = (sensor: SensorResponse) => {
    setSelectedSensor(sensor);
    if (form) {
      form.setFieldValue('cameraSensorId', sensor.id);
    }
  };

  const handleSelectSensorOnForm = (sensorId: string) => {
    const foundSensor = cameraSensors.find((c) => c.id === sensorId)
    if (foundSensor) {
      setSelectedSensor(foundSensor);
    }
  };

  return (
    <ContentWrapperDark>
      {contextHolder}
      <PageHeader2 breadcrumbItems={breadcrumbItems} />
      <Card>
        <>
          <div className='font-bold mb-2'>Select a Camera Sensor from the list or by selecting a Marker on the Map</div>
          <Form className="w-full" form={form} layout="vertical">
            <Form.Item name="cameraSensorId" label="Camera Sensor:" rules={[{ required: true }]}>
              <Select placeholder="Select a Camera Sensor" onChange={handleSelectSensorOnForm} className="w-full">
                <Select.Option key={'labels'} value={null} disabled className="bg-green-50 text-black" >
                  <div className="flex py-2">
                    <div className="flex-[1] font-semibold text-gray-900">Name</div>
                    <div className="flex-[1] font-semibold text-gray-900">Identifier Number</div>
                    <div className="flex-[1] font-semibold text-gray-900">Distance</div>
                    <div className="flex-[1] font-semibold text-gray-900">Availability</div>
                  </div>
                </Select.Option>
                {cameraSensors?.map((s) => (
                  <Select.Option key={s.id} value={s.id} disabled={s.cameraFacilityAttractionName}>
                    <Tooltip title={''}>
                      <div className="flex">
                        <div className="flex-[1] font-semibold">{s.name}</div>
                        <div className="flex-[1]">{s.identifierNumber}</div>
                        <div className="flex-[1]">{s.distance} m away</div>
                        <div className="flex-[1]">{s.cameraFacilityAttractionName ? <span className='text-error opacity-50'>Used in {s.cameraFacilityAttractionName}</span> : <Tag color='green' bordered={false}>Available</Tag>}</div>
                      </div>
                    </Tooltip>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <div
              style={{
                height: '45vh',
                zIndex: 1,
              }}
              className="rounded overflow-hidden"
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
                <PolygonFitBounds geom={park?.geom} polygonLabel={park?.name} />
                {selectedParkZones &&
                  selectedParkZones?.length > 0 &&
                  selectedParkZones.map((zone) => (
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
                {attraction && attraction.lat && attraction.lng && (
                  <PictureMarker
                    id={attraction.id}
                    entityType="ATTRACTION"
                    circleWidth={37}
                    lat={attraction.lat}
                    lng={attraction.lng}
                    tooltipLabel={attraction.title}
                    backgroundColor={COLORS.sky[300]}
                    icon={<TbBuildingEstate className="text-sky-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
                  />
                )}
                {cameraSensors
                .filter((s) => !s.cameraFacilityAttractionName)
                .map(
                  (s) =>
                    s.lat &&
                    s.long && (
                      <PictureMarker
                        id={s.id}
                        entityType="SENSOR"
                        circleWidth={37}
                        lat={s.lat}
                        lng={s.long}
                        tooltipLabel={s.name}
                        backgroundColor={COLORS.gray[400]}
                        icon={<MdOutlinePhotoCamera className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
                        markerFields={{
                          eventHandlers: {
                            click: () => {
                              handleSelectSensor(s);
                            },
                          },
                        }}
                        hovered={selectedSensor ? { ...selectedSensor, title: 'keke', entityType: 'SENSOR' } : null}
                      />
                    )
                )}
                {/* <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} /> */}
              </MapContainer>
            </div>
            <Flex className="w-full max-w-[600px] mx-auto mt-4" gap={10}>
              <Button type="primary" className="w-full" onClick={handleSubmit} disabled={!formSensorId}>
                Submit
              </Button>
            </Flex>
          </Form>
        </>
      </Card>
    </ContentWrapperDark>
  );
};

export default AttractionAssignCamera;
