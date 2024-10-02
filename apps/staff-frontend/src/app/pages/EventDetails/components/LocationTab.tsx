import { EventResponse, FacilityResponse, getZonesByParkId, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Card, Checkbox, Space, Tooltip } from 'antd';
import { TbEdit, TbStar, TbTicket, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import PictureMarker from '../../../components/map/PictureMarker';
import { COLORS } from '../../../config/colors';
import { FaCalendarAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';

interface LocationTabProps {
  event: EventResponse;
  facility: FacilityResponse;
  park: ParkResponse;
}

const LocationTab = ({ event, facility, park }: LocationTabProps) => {
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
          zIndex: 1,
        }}
        className="rounded-xl overflow-hidden"
      >
        {/* <Tooltip title="Edit Location">
        <div className="absolute z-20 flex justify-end w-full mt-4 pr-4">
          <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`edit-map`)}>
            Edit
          </Button>
        </div>
      </Tooltip> */}
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
            id={facility.id}
            entityType="FACILITY"
            circleWidth={37}
            lat={facility.lat ?? 0}
            lng={facility.long ?? 0}
            tooltipLabel={
              <div className="text-center">
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm text-gray-500">
                  @ {} {facility.name}
                </div>
              </div>
            }
            backgroundColor={COLORS.green[300]}
            icon={<TbStar className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
          />
        </MapContainer>
      </div>
    </>
  );
};

export default LocationTab;
