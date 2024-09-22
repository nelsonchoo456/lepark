import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { COLORS } from '../../../config/colors';
// Add this new import
import { AdjustLatLngInterface } from '../SensorCreate2';
interface SensorCreateMapProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  formValues: any;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}


const SensorCreateMap = ({ handleCurrStep, adjustLatLng, lat, lng, formValues }: SensorCreateMapProps) => {
  return (
    <>
      <div className='mt-4'>
        <div className='font-semibold'>Instructions:
        </div> Drag the Marker to set the location of your sensor.
      </div>
      <div
        style={{
          height: '45vh',
          zIndex: 1,
        }}
        className="py-4 rounded overflow-hidden"
      >
        <MapContainer
          center={[lat, lng]}
          zoom={11}
          className="leaflet-mapview-container"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} backgroundColor={COLORS.sky[400]} />
        </MapContainer>
      </div>
    </>
  );
};

export default SensorCreateMap;
