import { AttractionResponse, getZonesByParkId, ParkResponse, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Card, Checkbox, Space, Tooltip } from 'antd';
import { TbEdit, TbTicket, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { PiPlantFill } from 'react-icons/pi';
import { FaHome, FaTicketAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';

interface MapTabProps {
  attraction: AttractionResponse;
  park: ParkResponse;
  user: StaffResponse | null;
}
const MapTab = ({ attraction, park, user }: MapTabProps) => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneResponse[]>();

  const [showZones, setShowZones] = useState<boolean>(true);

  useEffect(() => {
    if (park.id) {
      fetchZones();
    }
  }, [park]);

  const fetchZones = async () => {
    const zonesRes = await getZonesByParkId(park.id);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  };

  return (
    <>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-2 mb-4">
        <Space size={16} className="flex-wrap">
          <div className="font-semibold">Display:</div>
          <Checkbox
            onChange={(e) => setShowZones(e.target.checked)}
            checked={showZones}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Zones
          </Checkbox>
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
          <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.9 }} />
          {showZones &&
            zones &&
            zones.map((zone) => (
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
            ))}
          <PictureMarker
            circleWidth={37}
            lat={attraction.lat}
            lng={attraction.lng}
            tooltipLabel={attraction.title}
            backgroundColor={COLORS.mustard[300]}
            icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
            id={attraction.id}
            entityType={'ATTRACTION'}
            setHovered={function (hovered: any): void {
              throw new Error('Function not implemented.');
            }}
          />
        </MapContainer>

        <div className="absolute top-4 right-3 z-[1000]">
        {(user?.role === StaffType.SUPERADMIN || (user?.role === StaffType.MANAGER && user?.parkId === attraction.parkId)) && (
        <Tooltip title="Edit Location">
          <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`edit-map`)}>
            Edit Location
          </Button>
        </Tooltip>
      )}
        </div>
      </div>
    </>
  );
};

export default MapTab;
