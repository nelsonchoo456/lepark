// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { CustButton } from '@lepark/common-ui';
//species form
import React from 'react';

import { useNavigate } from 'react-router-dom';

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

  //navigation
  const navigate = useNavigate();

  // Species form


  return webMode ? (
    <div
      className="h-screen w-[calc(100vw-var(--sidebar-width))] p-10" // page wrapper - padding
      style={{
        zIndex: 1,
      }}
    >
      <h1 className="header-1 mb-4">Species</h1>
      <CustButton type="primary" onClick={()=>navigate('/species/create')}>
        Create Species
      </CustButton>  {/*TODO: fix aesthetics*/}
      {}
    </div>
  ) : (
    <div
      className="h-[calc(100vh-2rem)] w-screen p-4" // page wrapper - padding
    >
       <h1 className="header-1 mb-4">Species Mobile Mode</h1>
       {/* Add your mobile content here */}
    </div>
  );
};

export default SpeciesPage;
