import { FacilityResponse, HubResponse, ParkResponse, ZoneResponse, StaffResponse, StaffType, SensorResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { TbBuildingEstate, TbEdit, TbTree } from 'react-icons/tb';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { MdOutlineHub, MdSensors } from 'react-icons/md';
import { useAuth } from '@lepark/common-ui';
import { Button, Card, Checkbox, Space, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface MapTabProps {
  lat: number;
  lng: number;
  hub: HubResponse;
  park?: ParkResponse | null;
  zone: ZoneResponse;
  zones: ZoneResponse[];
  sensors?: SensorResponse[];
}

const ZoneTab = ({ lat, lng, hub, park, zone, zones, sensors }: MapTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [showSensors, setShowSensors] = useState(false);

  const canActivateEdit = user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER;

  return (
    <>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mb-4">
        <Space size={16} className="flex-wrap">
          <div className="font-semibold">Display:</div>
          {park && (
            <Checkbox
              onChange={(e) => setShowSensors(e.target.checked)}
              checked={showSensors}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              Sensors
            </Checkbox>
          )}
        </Space>
      </Card>
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
              backgroundColor={COLORS.gray[600]}
              icon={<MdOutlineHub className="text-gray-500 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
            />
          )}
          <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.9 }} color={COLORS.green[600]} polygonLabel={zone?.name} />
          {zone &&
            zones
              .filter((z) => z.id !== zone.id)
              .map((z) => (
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
              ))}
          {showSensors &&
            sensors &&
            sensors.map(
              (s) =>
                s.lat &&
                s.long && (
                  <PictureMarker
                    id={s.id}
                    entityType="HUB"
                    circleWidth={37}
                    lat={s.lat}
                    lng={s.long}
                    tooltipLabel={s.name}
                    backgroundColor={COLORS.gray[400]}
                    icon={<MdSensors className="text-slate-400 drop-shadow-lg" style={{ fontSize: '1.4rem' }} />}
                  />
                ),
            )}
        </MapContainer>
        {canActivateEdit && (
          <div className="absolute top-4 right-3 z-[1000]">
            <Tooltip title="Edit Location">
              <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/hubs/${hub.id}/edit-location`)}>
                Edit Location
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );
};

export default ZoneTab;
