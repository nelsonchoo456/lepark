import { Input } from 'antd';
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import MapFeatureManager from '../../../components/map/MapFeatureManager';
import { useEffect, useState } from 'react';
import { ParkResponse } from '@lepark/data-access';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  polygon: any[]
  setPolygon: (item: any[]) => void;
  lines: any[]
  setLines: (item: any[]) => void;
  formValues: any;
  parks: ParkResponse[];
}

const CreateMapStep = ({ handleCurrStep, polygon, setPolygon, lines, setLines, formValues, parks }: CreateMapStepProps) => {
  const [selectedPark, setSelectedPark] = useState<ParkResponse>();

  useEffect(() => {
    if (parks?.length > 0 && formValues && formValues.zoneId) {
      const selectedPark = parks.find((z) => z.id === formValues.parkId);
      setSelectedPark(selectedPark);
    }
  }, [parks]);

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
          key="zone-create"
        >
          {selectedPark?.geom?.coordinates && selectedPark?.geom.coordinates.length > 0 && (
            <Polygon
              positions={selectedPark?.geom.coordinates[0].map((item: number[]) => [item[1], item[0]])}
              pathOptions={{ color: '#006400', fillColor: '#006400' }}
            />
          )}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFeatureManager polygon={polygon} setPolygon={setPolygon}  lines={lines} setLines={setLines}/>
        </MapContainer>
      </div>
    // </>
  );
};

export default CreateMapStep;
