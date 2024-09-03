// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';

const SpeciesPage = () => {
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

  return webMode ? (
    <div
      style={{
        height: '100vh',
        width: `calc(100vw - ${SIDEBAR_WIDTH})`,

        zIndex: 1,
      }}
    >
      <h1>Species</h1>
    </div>
  ) : (
    <div
      style={{
        height: 'calc(100vh - 2rem)',
        width: `100vw`,
      }}
    >
       <h1>Species Mobile Mode</h1>
    </div>
  );
};

export default SpeciesPage;
