import { MapContainer, TileLayer } from 'react-leaflet';
import DraggableMarker from '../../../components/map/DraggableMarker';
import { AdjustLatLngInterface } from '../FacilityCreate';

interface CreateMapStepProps {
  handleCurrStep: (step: number) => void;
  lat: number;
  lng: number;
  formValues: any;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}

const CreateMapStep = ({ handleCurrStep, adjustLatLng, lat, lng, formValues }: CreateMapStepProps) => {
  return (
    <>
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker adjustLatLng={adjustLatLng} lat={lat} lng={lng} />
        </MapContainer>
      </div>
      <div className="font-semibold mb-2 text-[#006400]">Drag the marker to set the facility location</div>
    </>
  );
};

export default CreateMapStep;
