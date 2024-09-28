import { AttractionResponse, ParkResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Tooltip } from 'antd';
import { TbEdit, TbTicket } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { PiPlantFill } from 'react-icons/pi';
import { FaHome, FaTicketAlt } from 'react-icons/fa';

interface MapTabProps {
  attraction: AttractionResponse;
  park: ParkResponse;
}
const MapTab = ({ attraction, park }: MapTabProps) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '60vh',
        position: 'relative',
      }}
      className="rounded-xl overflow-hidden"
    >
      <MapContainer
        center={[1.287953, 103.851784]}
        zoom={11}
        className="leaflet-mapview-container"
        style={{ height: '100%', width: '100%', zIndex: 10 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }}/>
        <PictureMarker circleWidth={37} lat={attraction.lat} lng={attraction.lng} tooltipLabel={attraction.title} backgroundColor={COLORS.mustard[300]} icon={<TbTicket className='text-mustard-600 drop-shadow-lg' style={{ fontSize: "3rem" }} />} id={''} entityType={''} setHovered={function (hovered: any): void {
          throw new Error('Function not implemented.');
        } } />
    
      </MapContainer>
      
      <div className="absolute top-4 right-3 z-[1000]">
        <Tooltip title="Edit Location">
          <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`edit-map`)}>
            Edit Location
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default MapTab;
