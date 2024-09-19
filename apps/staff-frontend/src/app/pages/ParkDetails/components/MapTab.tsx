import { ParkResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';

interface MapTabProps {
  park: ParkResponse;
}
const MapTab = ({ park }: MapTabProps) => {
  return (
    <div
      style={{
        height: '60vh',
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
        <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }}/>
      </MapContainer>
    </div>
  );
};

export default MapTab;
