import { OccurrenceResponse, ZoneResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Tooltip } from 'antd';
import { TbEdit } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useRestrictOccurrence } from '../../../hooks/Occurrences/useRestrictOccurrence';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { PiPlantFill } from 'react-icons/pi';
import { useAuth } from '@lepark/common-ui';

interface MapTabProps {
  occurrence: OccurrenceResponse;
  zone: ZoneResponse;
}

const OccurrenceMapTab = ({ occurrence, zone }: MapTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();

  const canEditLocation = user?.role === StaffType.SUPERADMIN ||
    user?.role === StaffType.MANAGER ||
    user?.role === StaffType.BOTANIST ||
    user?.role === StaffType.ARBORIST;

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
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.9 }} polygonLabel={zone?.name}/>
        <PictureMarker id={occurrence.id} entityType="OCCURRENCE" circleWidth={37} lat={occurrence.lat} lng={occurrence.lng} tooltipLabel={occurrence.title} backgroundColor={COLORS.green[300]} icon={<PiPlantFill className='text-green-600 drop-shadow-lg' style={{ fontSize: "3rem" }}/>} />
      </MapContainer>
      
      {canEditLocation && (
        <div className="absolute top-4 right-3 z-[1000]">
          <Tooltip title="Edit Location">
            <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/occurrences/${occurrence.id}/edit-location`)}>
              Edit Location
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default OccurrenceMapTab;
