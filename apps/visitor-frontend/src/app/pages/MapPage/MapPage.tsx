// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MOBILE_SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';

const MapPage = () => {
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
        width: `calc(100vw - ${MOBILE_SIDEBAR_WIDTH})`,

        zIndex: 1,
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
      </MapContainer>
    </div>
  ) : (
    <div
      style={{
        height: 'calc(100vh - 2rem)',
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
      </MapContainer>
    </div>
  );
};

export default MapPage;
