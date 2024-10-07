import { FacilityResponse, HubResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { TbBuildingEstate, TbTree } from 'react-icons/tb';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';

interface MapTabProps {
  lat: number,
  lng: number,
  hub: HubResponse
  park?: ParkResponse | null;
  zone: ZoneResponse;
  zones: ZoneResponse[];
}

const ZoneTab = ({ lat, lng, hub, park, zone, zones }: MapTabProps) => {

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
        {park && <PolygonWithLabel key={park?.id} entityId={park?.id} geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }} />}
        {hub && (
          <PictureMarker
            id={hub.id}
            entityType="HUB"
            circleWidth={37}
            lat={lat}
            lng={lng}
            tooltipLabel={hub.name}
            backgroundColor={COLORS.sky[300]}
            icon={<TbBuildingEstate className="text-sky-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
          />
        )}
        <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.9 }} color={COLORS.green[600]} polygonLabel={zone?.name}/>
        {zone && zones.filter((z) => z.id !== zone.id).map((z) =>
          <PolygonWithLabel
            key={z.id}
            entityId={z.id}
            geom={z.geom}
            polygonLabel={
              <div className="flex items-center gap-2">
                <TbTree className="text-xl" />
                {z.name}
              </div>
            }
            color={COLORS.green[600]}
            fillColor={'transparent'}
              labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
            />
          
        )}
      </MapContainer>
    </div>
  );
};

export default ZoneTab;
