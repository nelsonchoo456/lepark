// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ContentWrapperDark, SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { Button, Result } from 'antd';
import { IoIosInformationCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const MapPage = () => {
  const navigate = useNavigate();
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ContentWrapperDark className='h-screen flex items-center justify-center'>
      <Result
        icon={<IoIosInformationCircle className='text-5xl mx-auto text-mustard-500/50'/>}
        title="Coming Soon"
        subTitle="Map Page coming soon."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Return to Home Page
          </Button>
        }
      />
    </ContentWrapperDark>
  );

  // return webMode ? (
  //   <div
  //     style={{
  //       height: '100vh',
  //       width: `calc(100vw - ${SIDEBAR_WIDTH})`,

  //       zIndex: 1,
  //     }}
  //   >
  //     <MapContainer
  //       center={[1.287953, 103.851784]}
  //       zoom={11}
  //       className="leaflet-mapview-container"
  //       style={{ height: '100%', width: '100%' }}
  //     >
  //       <TileLayer
  //         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //       />
  //     </MapContainer>
  //   </div>
  // ) : (
  //   <div
  //     style={{
  //       height: 'calc(100vh - 2rem)',
  //       width: `100vw`,
  //     }}
  //   >
  //     <MapContainer
  //       center={[1.287953, 103.851784]}
  //       zoom={11}
  //       className="leaflet-mapview-container"
  //       style={{ height: '100%', width: '100%' }}
  //     >
  //       <TileLayer
  //         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //       />
  //     </MapContainer>
  //   </div>
  // );
};

export default MapPage;
