import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from './FacilityCreate';
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

const FacilityAssignCamera = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { facility, park, loading } = useRestrictFacilities(facilityId);
  const [cameraSensors, setCameraSensors] = useState<(SensorResponse & {distance?: number, cameraFacilityAttractionName?: string })[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorResponse>();
  const [selectedParkZones, setSelectedParkZones] = useState<ZoneResponse[]>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const formSensorId = Form.useWatch('cameraSensorId', form);

  useEffect(() => {
    if (facility) {
      fetchCameraSensors(facility.parkId);
    }
  }, [facility]);

  const fetchCameraSensors = async (parkId: number) => {
    if (!facility) return;
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

          // Calculate distance if lat/long are available for both sensor and facility
          let distance;
          if (s.lat && s.long && facility.lat && facility.long) {
            distance = turf.distance(
              turf.point([facility.long, facility.lat]),
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
    if (!facility || !formSensorId) return;
    try {
      const response = await updateFacilityCameraSensor(facility.id, formSensorId);
      if (response.status === 200) {
        messageApi.success('Saved changes to Facility Camera Sensor. Redirecting to Facility details page...');
        setTimeout(() => navigate(`/facilities/${facility.id}`), 1000);
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('Camera Sensor not found')) {
        messageApi.error('Camera Sensor not found');
      } else {
        messageApi.open({
          type: 'error',
          content: 'An unexpected error occurred while updating the facility.',
        });
      }
    }
  }

  const breadcrumbItems = [
    {
      title: 'Facility Management',
      pathKey: '/facilities',
      isMain: true,
    },
    {
      title: facility?.name ? facility?.name : 'Details',
      pathKey: `/facilities/${facility?.id}`,
    },
    {
      title: 'Assign Camera',
      pathKey: `/facilities/${facility?.id}/assign-camera`,
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
                {facility && facility.lat && facility.long && (
                  <PictureMarker
                    id={facility.id}
                    entityType="FACILITY"
                    circleWidth={37}
                    lat={facility.lat}
                    lng={facility.long}
                    tooltipLabel={facility.name}
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

export default FacilityAssignCamera;
