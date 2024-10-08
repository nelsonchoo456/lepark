import { FacilityResponse, HubResponse, ParkResponse, SensorResponse, ZoneResponse } from '@lepark/data-access';
import { Circle, MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { TbBuildingEstate, TbTree } from 'react-icons/tb';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { MdOutlineHub, MdSensors } from 'react-icons/md';
import { useEffect, useState } from 'react';

interface MapTabProps {
  lat: number,
  lng: number,
  sensor: SensorResponse,
  hub: HubResponse
  park?: ParkResponse | null;
  zones: ZoneResponse[];
}

const ZoneTab = ({ lat, lng, sensor, hub, park, zones }: MapTabProps) => {
  const [zone, setZone] = useState<ZoneResponse>();

  useEffect(() => {
    if (hub.zoneId && zones?.length > 0) {
      const zone = zones.find((z) => z.id === hub.zoneId);
      setZone(zone);
    }
  }, [hub, zones])
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
        {hub && hub.lat && hub.long &&(
          <PictureMarker
            id={hub.id}
            entityType="HUB"
            circleWidth={37}
            lat={hub.lat}
            lng={hub.long}
            tooltipLabel={hub.name}
            backgroundColor={COLORS.gray[600]}
            icon={<MdOutlineHub className="text-gray-500 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
          />
        )}
        {sensor && (<>
          <PictureMarker
            id={sensor.id}
            entityType="HUB"
            circleWidth={37}
            lat={lat}
            lng={lng}
            tooltipLabel={sensor.name}
            backgroundColor={COLORS.gray[400]}
            icon={<MdSensors className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
          />
          <Circle center={[lat, lng]} radius={30} pathOptions={{ color: COLORS.gray[400] }} />
        </>)}
        <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.9 }} color={COLORS.green[600]} polygonLabel={zone?.name}/>
        {zone && zones.filter((z) => z.id !== zone?.id).map((z) =>
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
