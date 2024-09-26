// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import MainLayout from '../../components/main/MainLayout';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MOBILE_SIDEBAR_WIDTH } from '@lepark/common-ui';
import { SCREEN_LG } from '../../config/breakpoints';
import { Button, Input, Select } from 'antd';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { FaFilter } from 'react-icons/fa6';
import withParkGuard from '../../park-context/withParkGuard';

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
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  ) : (
    <div
      style={{
        height: 'calc(100vh - 2rem)',
        width: `100vw`,
        position: 'relative'
      }}
    >
      {/* <Input className='absolute z-50'/> */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '100%',
          padding: '0 1rem',
          maxWidth: '600px',
        }}
      >
        <Select
          showSearch
          defaultActiveFirstOption={false}
          suffixIcon={<FiSearch/>}
          filterOption={false}
          className='w-full'
          // onSearch={handleSearch}
          // onChange={handleChange}
          // notFoundContent={null}
          // options={(data || []).map((d) => ({
          //   value: d.value,
          //   label: d.text,
          // }))}
        />
        <div className='flex justify-end mt-2'>
          <Button type='primary' icon={<FiFilter/>} size="large"/>
        </div>
      </div>
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
      </MapContainer>
    </div>
  );
};

export default withParkGuard(MapPage);
