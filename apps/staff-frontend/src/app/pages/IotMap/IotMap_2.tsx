// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvent } from 'react-leaflet';
import { ContentWrapperDark, LogoText, SIDEBAR_WIDTH, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import {
  Avatar,
  Button,
  Drawer,
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
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import {
  getHubsFiltered,
  getParkById,
  getSensorsByParkId,
  HubResponse,
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
import { MdOutlineHub, MdSensors } from 'react-icons/md';
import PictureMarker from '../../components/map/PictureMarker';
import { getSensorIcon } from './components/getSensorIcon';
import MarkerClusterGroup from 'react-leaflet-cluster';

const IotMap = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks } = useFetchParks();
  const { zones } = useFetchZones();
  const [park, setPark] = useState<ParkResponse>();
  const [parkId, setParkId] = useState<number>();
  const [parkZones, setParkZones] = useState<ZoneResponse[]>();
  const [hubs, setHubs] = useState<HubResponse[]>();
  const navigate = useNavigate();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const notificationShown = useRef(false);

  // Map behavior
  const [selectedZone, setSelectedZone] = useState<ZoneResponse>();
  const [selectedHub, setSelectedHub] = useState<HubResponse>();
  const [selectedSensor, setSelectedSensor] = useState<SensorResponse>();

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
      setSelectedHub(hubs.find((h) => h.zoneId === selectedZone.id));
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
        console.log(hubsRes.data);
        setHubs(hubsRes.data);
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

  const handleParkPolygonClick = (map: L.Map, geom: [number, number][], id: string | number) => {
    setSelectedZone(parkZones?.find((z) => z.id === id));
    map.fitBounds(geom);
  };

  // const handleHubListClick = (geom: [number, number][], z?: ZoneResponse) => {
  //   setSelectedZone(z);
  //   // how to zoom into map here

  //   const map = L.map('map'); // Use your existing map instance instead of creating a new one

  //   map.fitBounds(geom); // Set view to the selected hub's coordinates, and zoom to level 16
  // };

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
      title: 'Iot Management',
      pathKey: '/sensor-map',
      isMain: true,
      isCurrent: true,
    },
  ];

  return webMode ? (
    <div
      style={{
        height: '100vh',
        width: `calc(100vw - ${SIDEBAR_WIDTH} - 350px)`,
        zIndex: 1,
      }}
    >
      <Drawer open={true} closable={false} width={350} key="maps" mask={false} styles={{ body: { padding: '1rem' } }}>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        {hubs?.map((h) => (
          <>
            <div className="border-b-[1px] border-black/10 py-4 px-2 hover:bg-green-400/10">
              <div className="flex justify-between gap-2 ">
                <span className="font-semibold text-wrap">{h.name}</span>
              </div>
              <div className="flex mt-2 justify-between">
                <div className="flex gap-2 items-center text-green-400">
                  @<span className="font-semibold text-wrap">{h.zone?.name}</span>
                </div>
                <Tooltip title="View Details">
                  <Button icon={<FiEye />} shape="circle" size="small" onClick={() => navigate(`/hub/${h.id}`)}></Button>
                </Tooltip>
              </div>
            </div>
            <div className="bg-gray-100">
              {h.zoneId === selectedZone?.id &&
                h.sensors?.map((s) => (
                  <div className="px-2 py-2 border-b-[1px] border-black/10">
                    <span className="font-semibold text-wrap">{s.name}</span>
                    <div className="flex justify-between text-xs">
                      <Tag bordered={false}>{formatEnumLabelToRemoveUnderscores(s.sensorType)}</Tag>
                      <Tooltip title="View Sensor Details">
                        <Button
                          icon={<FiEye />}
                          shape="circle"
                          size="small"
                          onClick={() => navigate(`/sensor/${s.id}`)}
                          type="dashed"
                        ></Button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              {h.zoneId === selectedZone?.id && h.sensors?.length === 0 && (
                <div className="px-2 py-2 border-b-[1px] border-black/10 opacity-60 flex justify-center">No Sensors connected.</div>
              )}
            </div>
          </>
        ))}
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

        {park && (
          <PolygonFitBounds
            key={park.id}
            // entityId={park.id}
            geom={park.geom}
            polygonLabel={park.name}
            // image={park.images && park.images.length > 0 ? park.images[0] : ''}
            color="transparent"
            // fillOpacity={0.8}
            // handlePolygonClick={handleParkPolygonClick}
            // handleMarkerClick={() => navigate(`/park/${park.id}`)} // not present in web mode
          />
        )}

        {/* SUPERADMIN */}
        {parkZones &&
          // && zoomLevel >= SHOW_ZONES_ZOOM
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
              color={COLORS.green[200]}
              fillColor={'transparent'}
              labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
              handlePolygonClick={handleParkPolygonClick}
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
              />
            ),
        )}

        {selectedHub && (
          <MarkerClusterGroup
            chunkedLoading
            key={selectedHub.id}
            maxClusterRadius={10000}
            spiderfyOnMaxZoom={false}
            disableClusteringAtZoom={18}
            showCoverageOnHover={true}
            onClick={() => setSelectedZone(selectedHub.zone)}
          >
            {selectedHub.sensors?.map(
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
                          setSelectedSensor(s);
                        },
                      },
                    }}
                  />
                ),
            )}
          </MarkerClusterGroup>
        )}

        {hubs
          ?.filter((h) => (selectedHub ? h.id !== selectedHub.id : true))
          .map((h) => (
            <MarkerClusterGroup
              chunkedLoading
              key={h.id}
              maxClusterRadius={10000}
              spiderfyOnMaxZoom={false}
              disableClusteringAtZoom={19}
              showCoverageOnHover={true}
              onClick={() => setSelectedZone(h.zone)}
            >
              {h.sensors && 
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
                              setSelectedSensor(s);
                            },
                          },
                        }}
                      />
                    ),
                )}
              {/* {h.sensors &&
                h.sensors.length === 1 &&
                h.sensors.map(
                  (s) =>
                    s.lat &&
                    s.long && (
                      <>
                        <Marker key={s.id} position={[s.lat, s.long]} />
                        <Marker key={s.id + '-2'} position={[s.lat, s.long]} />
                      </>
                    ),
                )} */}
            </MarkerClusterGroup>
          ))}
      </MapContainer>
    </div>
  ) : (
    <div
      style={{
        paddingTop: '3rem',
        height: 'calc(100vh)',
        width: `100vw`,
      }}
    >
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
              color={COLORS.green[600]}
              fillColor={'transparent'}
              labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
            />
          ))}

        {/* NON-SUPERADMIN */}
        {/* user?.role !== StaffType.SUPERADMIN && zoomLevel >= SHOW_ZONES_ZOOM &&
          zones?.length > 0 &&
          zones
            .map((zone) => (
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
            )) */}
      </MapContainer>
    </div>
  );
};

export default IotMap;
