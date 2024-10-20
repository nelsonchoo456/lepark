// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvent, useMap } from 'react-leaflet';
import { ContentWrapperDark, LogoText, SIDEBAR_WIDTH, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  Avatar,
  Button,
  Card,
  Carousel,
  Checkbox,
  Collapse,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  List,
  message,
  Modal,
  notification,
  Result,
  Select,
  Space,
  Table,
  TableProps,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import {
  getHubsFiltered,
  getOccurrencesByParkId,
  getParkById,
  getSensorsByParkId,
  HubResponse,
  OccurrenceResponse,
  ParkResponse,
  SensorResponse,
  StaffResponse,
  StaffType,
  ZoneResponse,
} from '@lepark/data-access';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import L from 'leaflet';
import { COLORS } from '../../config/colors';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import PageHeader2 from '../../components/main/PageHeader2';
import { FiEye, FiZoomIn } from 'react-icons/fi';
import { TbTree } from 'react-icons/tb';
import { useFetchZones } from '../../hooks/Zones/useFetchZones';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import PolygonFitBounds from '../../components/map/PolygonFitBounds';
import { MdArrowBack, MdOutlineHub, MdSensors } from 'react-icons/md';
import PictureMarker from '../../components/map/PictureMarker';
import { getSensorIcon } from './components/getSensorIcon';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getHubDescriptionsItems, getSensorDescriptionItems } from './components/iotMapMisc';
import styled from 'styled-components';
import { PiPlantFill } from 'react-icons/pi';

const CollapsePanelNoPadding = styled(Collapse.Panel)`
  .ant-collapse {
    padding: 0 !important;
  }
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

interface MapZoomerProps {
  selectedHub?: HubResponse;
}

const MapZoomer = ({ selectedHub }: MapZoomerProps) => {
  const map = useMap();

  useEffect(() => {
    if (selectedHub && selectedHub.zone?.geom) {
      map.fitBounds(selectedHub.zone.geom.coordinates[0].map((item: number[]) => [item[1], item[0]]));
    }
  }, [selectedHub]);
  return null;
};

const IotMap = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const { zones } = useFetchZones();
  const [park, setPark] = useState<ParkResponse>();
  const [parkId, setParkId] = useState<number>();
  const [parkZones, setParkZones] = useState<ZoneResponse[]>();
  const [hubs, setHubs] = useState<(HubResponse & { occurrences: OccurrenceResponse[] })[]>();
  const navigate = useNavigate();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const mapRef = useRef<L.Map | null>(null);
  const notificationShown = useRef(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Map behavior
  const [selectedZone, setSelectedZone] = useState<ZoneResponse>();
  const [selectedHub, setSelectedHub] = useState<(HubResponse & { occurrences: OccurrenceResponse[] })>();
  const [selectedSensor, setSelectedSensor] = useState<SensorResponse>();
  const [showOccurrences, setShowOccurrences] = useState(false)

  // Map utilities
  const [zoomLevel, setZoomLevel] = useState(11);
  const SHOW_ZONES_ZOOM = 13;

  useEffect(() => {
    if (user?.parkId) {
      fetchPark(user.parkId);
      fetchHubs(user.parkId);
    }
  }, [user]);

  useEffect(() => {
    if (parkId) {
      fetchPark(parkId);
      fetchHubs(parkId);
    }
  }, [parkId]);

  useEffect(() => {
    if (park && zones) {
      setParkZones(zones.filter((z) => z.parkId === park.id));
    }
  }, [park, zones]);

  useEffect(() => {
    if (selectedZone && hubs) {
      const h = hubs.find((h) => h.zoneId === selectedZone.id);
      if (h) {
        // setSelectedHub(hubs.find((h) => h.zoneId === selectedZone.id));
      } else {
        messageApi.info(`Zone ${selectedZone.name} does not have a hub`);
      }
    }
  }, [selectedZone]);

  const fetchPark = async (parkId: number) => {
    try {
      const parkRes = await getParkById(parkId);
      if (parkRes.status === 200) {
        setPark(parkRes.data);
      }
    } catch (error) {
      message.error('Unable to Fetch Park');
    }
  };

  const fetchHubs = async (parkId: number) => {
    try {
      const hubsRes = await getHubsFiltered('ACTIVE', parkId);
      const sensorsRes = await getSensorsByParkId(parkId);
      const occurrencesRes = await getOccurrencesByParkId(parkId);
      if (hubsRes.status === 200) {
        if (sensorsRes.status === 200) {
          hubsRes.data.forEach((h: HubResponse) => {
            try {
              h.sensors = sensorsRes.data.filter((s) => s.hubId === h.id);
            } catch (e) {
              h.sensors = [];
            }
          });
        } else {
          hubsRes.data.forEach((h: HubResponse) => (h.sensors = []));
        }

        if (occurrencesRes.status === 200) {
          hubsRes.data.forEach((h: any) => {
            try {
              h.occurrences = occurrencesRes.data.filter((o) => o.zoneId === h.zoneId);
            } catch (e) {
              h.occurrences = [];
            }
          });
        } else {
          hubsRes.data.forEach((h: any) => (h.occurrences = []));
        }
        console.log(hubsRes.data);
        setHubs(hubsRes.data as (HubResponse & { occurrences: OccurrenceResponse[] })[]);
      }
    } catch (error) {
      message.error('Unable to Fetch IoT');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const MapZoomListener = () => {
    const map = useMapEvent('zoomend', () => {
      setZoomLevel(map.getZoom());
    });
    return null;
  };

  const columns: TableProps['columns'] = [
    {
      title: 'Park Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Flex justify="space-between" align="center" className="font-semibold">
          {text}
        </Flex>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      // width: '33%',
      fixed: 'left',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => text,
      sorter: (a, b) => {
        return a.address.localeCompare(b.address);
      },
      // width: '33%',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      render: (text) => text,
      sorter: (a, b) => {
        return a.contactNumber.localeCompare(b.contactNumber);
      },
      // width: '33%',
    },
    {
      title: 'Status',
      dataIndex: 'parkStatus',
      key: 'parkStatus',
      render: (text) => {
        switch (text) {
          case 'OPEN':
            return (
              <Tag color="green" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'UNDER_CONSTRUCTION':
            return (
              <Tag color="orange" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'LIMITED_ACCESS':
            return (
              <Tag color="yellow" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          case 'CLOSED':
            return (
              <Tag color="red" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
          default:
            return (
              <Tag color="default" bordered={false}>
                {formatEnumLabelToRemoveUnderscores(text)}
              </Tag>
            );
        }
      },
      filters: [
        { text: formatEnumLabelToRemoveUnderscores('OPEN'), value: 'OPEN' },
        { text: formatEnumLabelToRemoveUnderscores('UNDER_CONSTRUCTION'), value: 'UNDER_CONSTRUCTION' },
        { text: formatEnumLabelToRemoveUnderscores('LIMITED_ACCESS'), value: 'LIMITED_ACCESS' },
        { text: formatEnumLabelToRemoveUnderscores('CLOSED'), value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.parkStatus === value,
      // width: '1%',
      // width: '110px',
    },
  ];

  const breadcrumbItems = [
    {
      title: 'IoT Management',
      pathKey: '/sensor-map',
      isMain: true,
      isCurrent: true,
    },
  ];

  const handleSelectSensor = (sensor: SensorResponse) => {
    setSelectedSensor(sensor);
    if (selectedHub?.id !== sensor.hubId) {
      setSelectedHub(hubs?.find((h) => h.id === sensor.hubId));
    }
  };

  const showDrawerDisplay = () => {
    if (selectedSensor) {
      return (
        <>
          <div className="flex gap-2 items-center mb-4">
            {' '}
            <Button onClick={() => setSelectedSensor(undefined)} icon={<MdArrowBack className="text-md" />} type="text" size="small" />
            <div className="text-lg font-semibold text-green-600">Sensor Details</div>
          </div>
          {selectedSensor?.images && selectedSensor.images.length > 0 ? (
            <Carousel style={{ maxWidth: '100%' }}>
              {selectedSensor.images.map((url, index) => (
                <div key={index}>
                  <div
                    style={{
                      backgroundImage: `url('${url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      overflow: 'hidden',
                    }}
                    className="h-36 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="h-36 bg-gray-200 flex items-center justify-center">
              <Empty description="No Image" />
            </div>
          )}
          <div className="font-semibold text-wrap text-lg my-2">{selectedSensor.name}</div>
          <Descriptions items={getSensorDescriptionItems(selectedSensor)} column={1} size="small" className="mb-2" />
        </>
      );
    } else if (selectedHub) {
      return (
        <>
          <div className="flex gap-2 items-center mb-4">
            {' '}
            <Button
              onClick={() => {
                setSelectedHub(undefined);
                setSelectedZone(undefined);
              }}
              icon={<MdArrowBack className="text-md" />}
              type="text"
              size="small"
            />
            <div className="text-lg font-semibold text-green-600">Hub Details</div>
          </div>
          {selectedHub?.images && selectedHub.images.length > 0 ? (
            <Carousel style={{ maxWidth: '100%' }}>
              {selectedHub.images.map((url, index) => (
                <div key={index}>
                  <div
                    style={{
                      backgroundImage: `url('${url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      overflow: 'hidden',
                    }}
                    className="h-36 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="h-36 bg-gray-200 flex items-center justify-center">
              <Empty description="No Image" />
            </div>
          )}
          <div className="font-semibold text-wrap text-lg my-2">{selectedHub.name}</div>
          <Descriptions items={getHubDescriptionsItems(selectedHub)} column={1} size="small" className="mb-2" />

          <Tabs className="mt-2 overflow-hidden" defaultActiveKey="1">
            <Tabs.TabPane tab={<div className="text-md font-semibold text-green-600">Sensors</div>} key="1">
              {selectedHub.sensors?.map((s) => (
                <div
                  className="px-2 py-2 border-b-[1px] border-black/10 cursor-pointer hover:bg-green-400/10"
                  onClick={() => handleSelectSensor(s)}
                >
                  <span className="font-semibold text-wrap">{s.name}</span>
                  <div className="flex justify-between text-xs">
                    <Tag bordered={false}>{formatEnumLabelToRemoveUnderscores(s.sensorType)}</Tag>
                    <Tooltip title="View Sensor Details">
                      <Button icon={<FiEye />} shape="circle" size="small" onClick={() => navigate(`/sensor/${s.id}`)} type="dashed" />
                    </Tooltip>
                  </div>
                </div>
              ))}
            </Tabs.TabPane>

            <Tabs.TabPane tab={<div className="text-md font-semibold text-green-600">Occurrences</div>} key="2">
              <div className="flex w-full">
                <Checkbox className="mb-3 text-green-500" onChange={(e) => setShowOccurrences(e.target.checked)} checked={showOccurrences}>
                  Show Occurrences on map
                </Checkbox>
              </div>
              {selectedHub.occurrences?.map((o) => (
                <div className="px-2 py-2 border-b-[1px] border-black/10 cursor-pointer flex hover:bg-green-400/10">
                  <div className="w-[40px] h-[40px] flex-shrink-0 mr-2 overflow-hidden rounded-full bg-slate-400/40">
                    {o.images && o.images.length > 0 
                    
                     ? <img src={o.images[0]} alt={o.title} className="w-full h-full object-cover" />
                      : <></>
                    }
                  </div>
                  <div>
                    <span className="font-semibold text-wrap">{o.title}</span>
                    <br />
                    <span className="text-wrap italic">{o.speciesName}</span>
                  </div>
                </div>
              ))}
            </Tabs.TabPane>
          </Tabs>
        </>
      );
    } else {
      return (
        <>
          <div className="text-lg font-semibold text-green-600">List of Hubs</div>

          {hubs && hubs.length > 0 ? (
            <>
              <div className="italic text-secondary mb-2">Click on a Hub below to zoom in and view more details</div>
              {hubs?.map((h) => (
                <div
                  className="border-b-[1px] border-black/10 py-4 px-2 cursor-pointer hover:bg-green-400/10"
                  onClick={() => setSelectedHub(h)}
                >
                  <div className="flex justify-between gap-2 ">
                    <span className="font-semibold text-wrap">{h.name}</span>
                  </div>
                  <div className="flex mt-2 justify-between">
                    <div className="flex gap-2 items-center text-green-400">
                      @<span className="font-semibold text-wrap">{h.zone?.name}</span>
                    </div>
                    <Tooltip title="View Details">
                      <Button icon={<FiEye />} shape="circle" size="small" onClick={() => navigate(`/hubs/${h.id}`)}></Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
              {user?.role === StaffType.SUPERADMIN && (
                <Button
                  onClick={() => {
                    setPark(undefined);
                    setParkId(undefined);
                  }}
                  className="w-full mt-4"
                  type="link"
                >
                  {' '}
                  Select Another Park?
                </Button>
              )}
            </>
          ) : (
            <div className="w-full flex-col flex">
              <div className="text-center w-full font-semibold text-secondary mt-10"> No Hubs available. </div>
              {user?.role === StaffType.SUPERADMIN && (
                <Button
                  onClick={() => {
                    setPark(undefined);
                    setParkId(undefined);
                  }}
                  className="mx-auto"
                  type="link"
                >
                  {' '}
                  Select Another Park?
                </Button>
              )}
            </div>
          )}
        </>
      );
    }
  };

  const showDrawerDisplayMobile = () => {
    if (selectedSensor) {
      return (
        <>
          <div className="flex gap-2 items-center mb-4">
            {' '}
            <Button onClick={() => setSelectedSensor(undefined)} icon={<MdArrowBack className="text-md" />} type="text" size="small" />
            <div className="text-lg font-semibold text-green-600">Sensor Details</div>
          </div>
          {selectedSensor?.images && selectedSensor.images.length > 0 ? (
            <Carousel style={{ maxWidth: '100%' }}>
              {selectedSensor.images.map((url, index) => (
                <div key={index}>
                  <div
                    style={{
                      backgroundImage: `url('${url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      overflow: 'hidden',
                    }}
                    className="h-20 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="h-20 bg-gray-200 flex items-center justify-center">
              <div className="text-secondary">No Image</div>
            </div>
          )}
          <div className="font-semibold text-wrap text-lg my-2">{selectedSensor.name}</div>
          <Descriptions items={getSensorDescriptionItems(selectedSensor)} column={1} size="small" className="mb-2" />
        </>
      );
    } else if (selectedHub) {
      return (
        <>
          <div className="flex gap-2 items-center mb-4">
            <div className="text-lg font-semibold text-green-600">Hub Details</div>
          </div>
          {selectedHub?.images && selectedHub.images.length > 0 ? (
            <Carousel style={{ maxWidth: '100%' }}>
              {selectedHub.images.map((url, index) => (
                <div key={index}>
                  <div
                    style={{
                      backgroundImage: `url('${url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      overflow: 'hidden',
                    }}
                    className="h-20 max-h-64 flex-1 rounded-lg shadow-lg p-4"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="h-20 bg-gray-200 flex items-center justify-center">
              <div className="text-secondary">No Image</div>
            </div>
          )}
          <div className="font-semibold text-wrap text-lg my-2">{selectedHub.name}</div>
          <Descriptions items={getHubDescriptionsItems(selectedHub)} column={1} size="small" className="mb-2" />
          <Card styles={{ body: { padding: 0 } }} className="mt-2 px-2 py-2 overflow-hidden">
            {selectedHub.sensors?.length} Sensors
          </Card>
        </>
      );
    } else {
      return <></>;
    }
  };

  return webMode ? (
    <div
      style={{
        height: '100vh',
        width: `calc(100vw - ${SIDEBAR_WIDTH} - 350px)`,
        zIndex: 1,
      }}
    >
      {contextHolder}
      <Drawer open={true} closable={false} width={350} key="maps" mask={false} styles={{ body: { padding: '1rem' } }}>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        {park ? showDrawerDisplay() : <div className="text-center w-full font-semibold text-secondary"> Please select a Park</div>}
      </Drawer>
      {!park && (
        <div
          className="h-full bg-black/40 absolute flex justify-center items-center"
          style={{ zIndex: 1000, width: `calc(100vw - ${SIDEBAR_WIDTH} - 350px)` }}
        >
          <div className="md:w-[500px] w-full bg-white rounded-lg p-4">
            <LogoText className="text-lg mb-4"> Select a Park to View</LogoText>
            <br />
            <Select placeholder="Select a Park" onChange={(parkId: number) => setParkId(parkId)} className="w-full">
              {parks?.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  <div className="flex">
                    <div className="flex-[1] font-semibold">{p.name}</div>
                    {p.parkStatus === 'OPEN' ? (
                      <Tag color="green" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : p.parkStatus === 'UNDER_CONSTRUCTION' ? (
                      <Tag color="orange" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : p.parkStatus === 'LIMITED_ACCESS' ? (
                      <Tag color="yellow" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : p.parkStatus === 'CLOSED' ? (
                      <Tag color="red" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : (
                      <></>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      )}
      <MapContainer
        center={[1.287953, 103.851784]}
        zoom={11}
        className="leaflet-mapview-container"
        style={{ height: '100%', width: `calc(100vw - ${SIDEBAR_WIDTH} - 350px)` }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomListener />
        <MapZoomer selectedHub={selectedHub} />
        {park && <PolygonFitBounds key={park.id} geom={park.geom} polygonLabel={park.name} color="transparent" />}

        {/* SUPERADMIN */}
        {parkZones &&
          parkZones?.length > 0 &&
          parkZones.map((zone) => (
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
              color={selectedHub?.zoneId === zone.id ? COLORS.sky[300] : COLORS.green[200]}
              fillColor={selectedHub?.zoneId === zone.id ? COLORS.sky[300] : 'transparent'}
              fillOpacity={0.6}
              labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
              handlePolygonClick={() => setSelectedZone(zone)}
            />
          ))}

        {hubs?.map(
          (h) =>
            h &&
            h.lat &&
            h.long && (
              <PictureMarker
                id={h.id}
                entityType="HUB"
                circleWidth={37}
                lat={h.lat}
                lng={h.long}
                tooltipLabel={h.name}
                backgroundColor={COLORS.gray[600]}
                icon={<MdOutlineHub className="text-gray-500 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
                markerFields={{
                  eventHandlers: {
                    click: () => {
                      setSelectedZone(h.zone);
                      setSelectedHub(h)
                    },
                  },
                }}
                hovered={selectedHub ? { ...selectedHub, title: 'keke', entityType: 'SENSOR' } : null}
              />
            ),
        )}

        {selectedHub && showOccurrences &&
          selectedHub.occurrences?.map(
            (o) =>
              o.lat &&
              o.lng && (
                <PictureMarker
                  id={o.id}
                  entityType="OCCURRENCE"
                  circleWidth={30}
                  lat={o.lat}
                  lng={o.lng}
                  backgroundColor={COLORS.green[300]}
                  icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                  tooltipLabel={o.title}
                />
              ),
          )}

        {selectedHub &&
          selectedHub.sensors?.map(
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
                  backgroundColor={COLORS.sky[400]}
                  icon={getSensorIcon(s)}
                  markerFields={{
                    eventHandlers: {
                      click: () => {
                        setSelectedZone(selectedHub.zone);
                        handleSelectSensor(s);
                      },
                    },
                  }}
                  hovered={selectedSensor ? { ...selectedSensor, title: 'keke', entityType: 'SENSOR' } : null}
                />
              ),
          )}

        {hubs
          ?.filter((h) => (selectedHub ? h.id !== selectedHub.id : true))
          .map(
            (h) =>
              h.sensors &&
              h.sensors.map(
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
                      backgroundColor={COLORS.sky[400]}
                      icon={getSensorIcon(s)}
                      markerFields={{
                        eventHandlers: {
                          click: () => {
                            setSelectedZone(h.zone);
                            handleSelectSensor(s);
                          },
                        },
                      }}
                    />
                  ),
              ),
          )}
      </MapContainer>
    </div>
  ) : (
    <div
      style={{
        paddingTop: '3rem',
        height: 'calc(100vh)',
        width: `100vw`,
        overflow: 'hidden',
      }}
      className="relative"
    >
      {contextHolder}
      {!park && (
        <div className="h-full w-full bg-black/40 absolute flex justify-center items-center px-4 pb-10" style={{ zIndex: 1000 }}>
          <div className="w-full bg-white rounded-lg p-4">
            <LogoText className="text-lg mb-4"> Select a Park to View</LogoText>
            <br />
            <Select placeholder="Select a Park" onChange={(parkId: number) => setParkId(parkId)} className="w-full">
              {parks?.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  <div className="flex">
                    <div className="flex-[1] font-semibold">{p.name}</div>
                    {p.parkStatus === 'OPEN' ? (
                      <Tag color="green" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : p.parkStatus === 'UNDER_CONSTRUCTION' ? (
                      <Tag color="orange" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : p.parkStatus === 'LIMITED_ACCESS' ? (
                      <Tag color="yellow" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : p.parkStatus === 'CLOSED' ? (
                      <Tag color="red" bordered={false}>
                        {formatEnumLabelToRemoveUnderscores(p.parkStatus)}
                      </Tag>
                    ) : (
                      <></>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      )}
      <MapContainer
        center={[1.287953, 103.851784]}
        zoom={11}
        className="leaflet-mapview-container"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomer selectedHub={selectedHub} />
        <MapZoomListener />
        {park && <PolygonFitBounds key={park.id} geom={park.geom} polygonLabel={park.name} color="transparent" />}

        {/* SUPERADMIN */}
        {parkZones &&
          parkZones?.length > 0 &&
          parkZones.map((zone) => (
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
              color={selectedHub?.zoneId === zone.id ? COLORS.sky[300] : COLORS.green[200]}
              fillColor={selectedHub?.zoneId === zone.id ? COLORS.sky[300] : 'transparent'}
              fillOpacity={0.6}
              labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
              handlePolygonClick={() => setSelectedZone(zone)}
            />
          ))}

        {hubs?.map(
          (h) =>
            h &&
            h.lat &&
            h.long && (
              <PictureMarker
                id={h.id}
                entityType="HUB"
                circleWidth={37}
                lat={h.lat}
                lng={h.long}
                tooltipLabel={h.name}
                backgroundColor={COLORS.gray[600]}
                icon={<MdOutlineHub className="text-gray-500 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
                hovered={selectedHub ? { ...selectedHub, title: 'keke', entityType: 'SENSOR' } : null}
              />
            ),
        )}

        {selectedHub &&
          selectedHub.sensors?.map(
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
                  backgroundColor={COLORS.sky[400]}
                  icon={getSensorIcon(s)}
                  markerFields={{
                    eventHandlers: {
                      click: () => {
                        setSelectedZone(selectedHub.zone);
                        handleSelectSensor(s);
                      },
                    },
                  }}
                  hovered={selectedSensor ? { ...selectedSensor, title: 'keke', entityType: 'SENSOR' } : null}
                />
              ),
          )}

        {hubs
          ?.filter((h) => (selectedHub ? h.id !== selectedHub.id : true))
          .map(
            (h) =>
              h.sensors &&
              h.sensors.map(
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
                      backgroundColor={COLORS.sky[400]}
                      icon={getSensorIcon(s)}
                      markerFields={{
                        eventHandlers: {
                          click: () => {
                            setSelectedZone(h.zone);
                            handleSelectSensor(s);
                          },
                        },
                      }}
                    />
                  ),
              ),
          )}
      </MapContainer>
      <div className="fixed bottom-0 w-full bg-white rounded-lg p-4" style={{ zIndex: 400 }}>
        {showDrawerDisplayMobile()}
      </div>
    </div>
  );
};

export default IotMap;
