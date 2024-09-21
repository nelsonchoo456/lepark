import { ParkResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Tooltip } from 'antd';
import { TbEdit } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

interface MapTabProps {
  park: ParkResponse;
}
const MapTab = ({ park }: MapTabProps) => {
  const navigate = useNavigate();

  return (
    // <>
    <div
      style={{
        height: '60vh',
        zIndex: 1,
      }}
      className="rounded-xl overflow-hidden"
    >
      <Tooltip title="Edit Boundaries">
        <div className="absolute z-20 flex justify-end w-full mt-4 pr-4"><Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/park/${park.id}/edit-map`)}>Edit </Button></div>
      </Tooltip>
      <MapContainer
        center={[1.287953, 103.851784]}
        zoom={11}
        className="leaflet-mapview-container"
        style={{ height: '100%', width: '100%', zIndex: 10 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }}/>
      </MapContainer>
    </div>
    // </>
  );
};

export default MapTab;
