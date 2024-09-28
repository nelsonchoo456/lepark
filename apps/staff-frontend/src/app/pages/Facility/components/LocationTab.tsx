import { FacilityResponse, ParkResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Tooltip } from 'antd';
import { TbBuildingEstate, TbEdit, TbTicket } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { PiPlantFill } from 'react-icons/pi';
import { FaHome, FaTicketAlt } from 'react-icons/fa';

interface MapTabProps {
  facility: FacilityResponse;
  park?: ParkResponse | null;
}
const MapTab = ({ facility, park }: MapTabProps) => {
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
      <Tooltip title="Edit Location">
        <div className="absolute z-20 flex justify-end w-full mt-4 pr-4">
          <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`edit-location`)}>
            Edit{' '}
          </Button>
        </div>
      </Tooltip>
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
        <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }} />
        {facility && facility.lat && facility.long && (
          <PictureMarker
            id={facility.id}
            entityType="FACILITY"
            circleWidth={37}
            lat={facility.lat}
            lng={facility.long}
            tooltipLabel={facility.name}
            backgroundColor={COLORS.sky[300]}
            icon={<TbBuildingEstate className="text-sky-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
          />
        )}
      </MapContainer>
    </div>
    // </>
  );
};

export default MapTab;
