import { OccurrenceResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Tooltip } from 'antd';
import { TbEdit } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useRestrictOccurrence } from '../../../hooks/Occurrences/useRestrictOccurrence';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { PiPlantFill } from 'react-icons/pi';

interface MapTabProps {
  occurrence: OccurrenceResponse;
  zone: ZoneResponse;
}
const OccurrenceMapTab = ({ occurrence, zone }: MapTabProps) => {
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
        <div className="absolute z-20 flex justify-end w-full mt-4 pr-4"><Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/occurrences/${occurrence.id}/edit-location`)}>Edit Location</Button></div>
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
        <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.9 }} polygonLabel={zone?.name}/>
        <PictureMarker circleWidth={37} lat={occurrence.lat} lng={occurrence.lng} tooltipLabel={occurrence.title} backgroundColor={COLORS.green[300]} icon={<PiPlantFill className='text-green-600 drop-shadow-lg' style={{ fontSize: "3rem" }}/>} />
      </MapContainer>
    </div>
    // </>
  );
};

export default OccurrenceMapTab;
