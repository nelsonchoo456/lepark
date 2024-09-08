import { Input } from 'antd';
import { MapContainer, TileLayer } from 'react-leaflet';
import { AdjustLatLngInterface } from '../ParkCreate';
import MapFeatureManager from '../../../components/map/MapFeatureManager';
import MapFeatureManager2 from '../../../components/map/MapFeatureManager2';
import { useEffect, useState } from 'react';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}

const CreateMapStep = ({ handleCurrStep, adjustLatLng, lat, lng }: CreateMapStepProps) => {

  return (
    // <>
      <div
        style={{
          height: '60vh',
          zIndex: 1,
        }}
        className='my-4 rounded overflow-hidden'
      >
        <MapContainer
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '60vh', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFeatureManager2/>
        </MapContainer>
      </div>
    // </>
  );
};

export default CreateMapStep;
