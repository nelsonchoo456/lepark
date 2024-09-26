import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../FacilityCreate';
import { ParkResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  formValues: any;
  parks: ParkResponse[];
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}

const CreateMapStep = ({ handleCurrStep, adjustLatLng, lat, lng, parks, formValues }: CreateMapStepProps) => {
  const [selectedPark, setSelectedPark] = useState<ParkResponse>();

  useEffect(() => {
    console.log(parks)
    if (parks?.length > 0 && formValues && formValues.parkId) {
      const selectedPark = parks.find((z) => z.id === formValues.parkId);
      setSelectedPark(selectedPark);
    }
  }, [parks, formValues.parkId]);
  
  return (
    <>
      <div className='mt-4'>
        <div className='font-semibold'>Instructions: 
        </div> Drag the Marker around within the boundaries of your selected Park.
      </div>
      <div
        style={{
          height: '45vh',
          zIndex: 1,
        }}
        className="py-4 rounded overflow-hidden"
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
          <PolygonFitBounds geom={selectedPark?.geom} adjustLatLng={adjustLatLng} lat={lat} lng={lng} polygonLabel={selectedPark?.name}/>
          <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} />
        </MapContainer>
      </div>
      {selectedPark?.geom?.coordinates && selectedPark?.geom.coordinates.length > 0 && 
        <div className='font-semibold mb-4 text-[#006400]'>Displaying Park: {selectedPark.name}</div>}
    </>
  );
};

export default CreateMapStep;
