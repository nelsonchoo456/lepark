import { FacilityResponse, ParkAssetResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { TbBuildingEstate, TbTree } from 'react-icons/tb';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';

interface MapTabProps {
  asset: ParkAssetResponse;
  park: ParkResponse | null;
  zones: ZoneResponse[];
}

const LocationTab = ({ asset, park, zones }: MapTabProps) => {
  const selectedParkId = park?.id;

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
        <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }} />
        {asset.facility && asset.facility.lat && asset.facility.long && (
          <PictureMarker
            id={asset.id}
            entityType="FACILITY"
            circleWidth={37}
            lat={asset.facility.lat}
            lng={asset.facility.long}
            tooltipLabel={asset.facility.name}
            backgroundColor={COLORS.sky[300]}
            icon={<TbBuildingEstate className="text-sky-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
          />
        )}
        {zones.map((zone) => (
          zone.parkId === selectedParkId && (
          <PolygonWithLabel
            key={zone.id}
            entityId={zone.id}
            geom={zone.geom}
            polygonLabel={
              <div className="flex items-center gap-2">
                <TbTree className="text-xl" />
                {zone.name}
              </div>
            }
            color={COLORS.green[600]}
            fillColor={'transparent'}
              labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default LocationTab;
