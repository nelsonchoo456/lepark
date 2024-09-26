import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import { ContentWrapperDark, SIDEBAR_WIDTH, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { Avatar, Button, Drawer, List, notification, Result, Select, Space, Table, Tooltip, Typography } from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { SensorResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useFetchSensors } from '../../hooks/Sensors/useFetchSensors';
import L from 'leaflet';
import { COLORS } from '../../config/colors';
import PageHeader2 from '../../components/main/PageHeader2';
import { FiEye } from 'react-icons/fi';
import { TbEdit } from 'react-icons/tb';
import { MdSensors } from 'react-icons/md';
import { renderToStaticMarkup } from 'react-dom/server';
import SensorStatusTag from './components/SensorStatusTag';

const SensorMap = () => {
  const { user } = useAuth<StaffResponse>();
 const { sensors, loading, triggerFetch } = useFetchSensors();
const sensorsWithCoordinates = sensors.filter(sensor => sensor.latitude && sensor.longitude);
  const navigate = useNavigate();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const notificationShown = useRef(false);
  const [filteredSensors, setFilteredSensors] = useState<SensorResponse[]>([]);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string | null>();
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>();

  // Map utilities
  const [zoomLevel, setZoomLevel] = useState(11);

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

  const handleSensorMarkerClick = (map: L.Map, latlng: [number, number], entityId: string | number) => {
    setSelectedSensorId(entityId.toString());
    map.setView(latlng, 15);
  };

  const breadcrumbItems = [
    {
      title: 'Sensors Management',
      pathKey: '/sensor/map',
      isMain: true,
      isCurrent: true,
    },
  ];

  return webMode ? (
    <div
      style={{
        height: '100vh',
        width: `calc(100vw - ${SIDEBAR_WIDTH} - 300px)`,
        zIndex: 1,
      }}
    >
      <Drawer open={true} closable={false} width={300} key="maps" mask={false} styles={{ body: { padding: '1rem' } }}>
        <PageHeader2 breadcrumbItems={breadcrumbItems} />
        {sensors &&
          sensors.map((sensor) => (
            <div key={sensor.id} className="border-b-[1px] border-black/10 py-4 px-2 hover:bg-green-400/10">
              <div className="flex justify-between gap-2 ">
                <div className="flex-auto">
                  <span className="font-semibold text-wrap">{sensor.sensorName}</span>
                </div>
              </div>
              <div className="flex mt-2 justify-between">
                <SensorStatusTag>{sensor.sensorStatus}</SensorStatusTag>
                <div className="flex gap-2">
                  <Tooltip title="Edit Sensor">
                    <div className="">
                      <Button
                        icon={<TbEdit />}
                        shape="circle"
                        size="small"
                        onClick={() => navigate(`/sensor/edit/${sensor.id}`)}
                      ></Button>
                    </div>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <div className="">
                      <Button icon={<FiEye />} shape="circle" size="small" onClick={() => navigate(`/sensor/${sensor.id}`)}></Button>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
      </Drawer>
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
        <MapZoomListener />

        {sensorsWithCoordinates.length > 0 &&
          sensorsWithCoordinates.map((sensor) => (
            <Marker
              key={sensor.id}
              position={[sensor.latitude ?? 0, sensor.longitude ?? 0]}
              eventHandlers={{
                click: (e) => handleSensorMarkerClick(e.target._map, [sensor.latitude ?? 0, sensor.longitude ?? 0], sensor.id),
              }}
              icon={L.divIcon({
                className: 'custom-icon',
                html: renderToStaticMarkup(
                  <div
                    style={{
                      backgroundColor: COLORS.green[600],
                      color: 'white',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MdSensors />
                  </div>
                ),
              })}
            >
              <Popup>
                <div>
                  <h3>{sensor.sensorName}</h3>
                  <p>Type: {sensor.sensorType}</p>
                  <p>Status: {sensor.sensorStatus}</p>
                </div>
              </Popup>
            </Marker>
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
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
       {sensorsWithCoordinates.length > 0 &&
  sensorsWithCoordinates.map((sensor) => (
    <Marker key={sensor.id} position={[sensor.latitude ?? 0, sensor.longitude ?? 0]}>
      <Popup>
        <div>
          <h3>{sensor.sensorName}</h3>
          <p>Type: {sensor.sensorType}</p>
          <p>Status: {sensor.sensorStatus}</p>
        </div>
      </Popup>
    </Marker>
  ))}
      </MapContainer>
    </div>
  );
};

export default SensorMap;
