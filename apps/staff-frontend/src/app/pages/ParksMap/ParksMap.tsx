// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { ContentWrapperDark, SIDEBAR_WIDTH, useAuth } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { Avatar, Button, Drawer, List, notification, Result, Space, Tooltip, Typography } from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { StaffResponse, StaffType } from '@lepark/data-access';
import { useFetchParks } from '../../hooks/Parks/useFetchParks';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { COLORS } from '../../config/colors';
import PolygonWithLabel from '../../components/map/PolygonWithLabel';
import { MdArrowOutward } from 'react-icons/md';
import PageHeader2 from '../../components/main/PageHeader2';
import { FiEye } from 'react-icons/fi';
import { TbEdit } from 'react-icons/tb';

const ParksMap = () => {
  const { user } = useAuth<StaffResponse>();
  const { parks, restrictedParkId, loading, triggerFetch } = useFetchParks();
  const navigate = useNavigate();
  const [webMode, setWebMode] = useState<boolean>(window.innerWidth >= SCREEN_LG);
  const notificationShown = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (user?.role !== StaffType.SUPERADMIN) {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the Park Management page!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }
  }, []);

  useEffect(() => {
    console.log(parks);
  }, [parks]);

  const getLabelIcon = (label: string) => {
    const iconHTML = renderToStaticMarkup(
      <span
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: `-1px -1px 0 ${COLORS.green[600]}, 1px -1px 0 ${COLORS.green[600]}, -1px 1px 0 ${COLORS.green[600]}, 1px 1px 0 ${COLORS.green[600]}`,
          textWrap: 'nowrap',
        }}
      >
        {label}
      </span>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [40, 40],
      className: '',
    });
  };

  const breadcrumbItems = [
    {
      title: 'Parks Management',
      pathKey: '/park/map',
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
      
      <Drawer open={true} closable={false} width={300} key="maps" mask={false} styles={{ body: { padding: '1rem' }}}>
        <PageHeader2 breadcrumbItems={breadcrumbItems}/>
        {parks &&
          parks.map((park) => (
            <div className='border-b-[1px] border-black/10 py-4 px-2 hover:bg-green-400/10'>
              <div className='flex justify-between gap-2 '>
                <div className="flex-auto">
                  <span className='font-semibold text-wrap'>{park.name}</span>
                </div>
                
              </div>
              <div className='flex gap-2 mt-2 justify-end'>
                {/* <Button size="small" shape='round'>Zoom In</Button> */}
                <Tooltip title="Edit Boundaries">
                  <div className=""><Button icon={<TbEdit />} shape="circle" type="primary" size="small" onClick={() => navigate(`/park/${park.id}/edit-map`)}></Button></div>
                </Tooltip>
                <Tooltip title="View Details">
                  <div className=""><Button icon={<FiEye />} shape="circle" type="primary" size="small" onClick={() => navigate(`/park/${park.id}`)}></Button></div>
                </Tooltip>
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
        {parks?.length > 0 && parks.map((park) => <PolygonWithLabel geom={park.geom} polygonLabel={park.name} />)}
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
        {parks?.length > 0 &&
          parks.map(
            (park) =>
              park.geom?.coordinates &&
              park.geom.coordinates.length > 0 && (
                <Polygon positions={park.geom.coordinates[0].map((item: number[]) => [item[1], item[0]])} />
              ),
          )}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
};

export default ParksMap;
