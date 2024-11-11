import {
  getParkById,
  ParkResponse,
  StaffResponse,
  StaffType,
  ZoneResponse,
} from '@lepark/data-access';
import { MapContainer, Pane, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Card, Checkbox, Space, Tooltip } from 'antd';
import { TbEdit } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@lepark/common-ui';
import HoverInformation from '../../../components/map/HoverInformation';
import MarkersGroup from '../../../components/map/MarkersGroup';
import { useFetchMarkersGroup } from '../../../components/map/hooks/useFetchMarkersGroup';
import HeatmapLayer from '../../../components/map/HeatMapLayer';

interface MapTabProps {
  zone: ZoneResponse;
}
const MapTab = ({ zone }: MapTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [park, setPark] = useState<ParkResponse>();

  const [showPark, setShowPark] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  
  useEffect(() => {
    if (zone.id) {
      fetchPark();
    }
  }, [zone]);

  const fetchPark = async () => {
    const parkRes = await getParkById(zone.parkId);
    if (parkRes.status === 200) {
      const parkData = parkRes.data;
      setPark(parkData);
    }
  };

  const {
    occurrences,
    attractions,
    facilities,
    facilityEvents,
    showOccurrences,
    setShowOccurrences,
    showAttractions,
    setShowAttractions,
    showFacilities,
    setShowFacilities,
    showEvents,
    setShowEvents,
    hovered,
    setHovered
  } = useFetchMarkersGroup({ zone });

  return (
    <>
     <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mb-4">
     <Space size={16} className='flex-wrap'>
        <div className="font-semibold">Display:</div>
        {park && (
          <Checkbox onChange={(e) => setShowPark(e.target.checked)} checked={showPark} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            {park.name} (Park)
          </Checkbox>
        )}
        <Checkbox onChange={(e) => setShowOccurrences(e.target.checked)} checked={showOccurrences} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            Occurrences
        </Checkbox>
        <Checkbox onChange={(e) => setShowAttractions(e.target.checked)} checked={showAttractions} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
          Attractions
        </Checkbox>
        <Checkbox onChange={(e) => setShowFacilities(e.target.checked)} checked={showFacilities} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
          Facilities
        </Checkbox>
        <Checkbox onChange={(e) => setShowEvents(e.target.checked)} checked={showEvents} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
          Events
        </Checkbox>
      </Space>
      </Card>
      {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER) &&
        <Card styles={{ body: { padding: 0 } }} className="px-4 py-2 mb-4">
          <Space size={16} className="flex-wrap">
            <div className="font-semibold">Crowd Level Display:</div>
            <Checkbox
              onChange={(e) => setShowHeatmap(e.target.checked)}
              checked={showHeatmap}
              className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
            >
              Heatmap Layer
            </Checkbox>
          </Space>
        </Card>
      }
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
          <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={zone?.name} />
          {showPark && (
            <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={park?.name} color="transparent" />
          )}
          
          
            {(showHeatmap && (user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER) && park && zone) && (
              <Pane name="heatmapPane" style={{ zIndex: 800 }}>
                <HeatmapLayer park={park} zone={zone}/>
              </Pane>
            )} 
          
          <MarkersGroup
            occurrences={occurrences}
            attractions={attractions}
            facilities={facilities}
            facilityEvents={facilityEvents}
            hovered={hovered}
            setHovered={setHovered}
            showOccurrences={showOccurrences}
            showAttractions={showAttractions}
            showFacilities={showFacilities}
            showEvents={showEvents}
            setShowEvents={setShowEvents}
          />
          
        </MapContainer>

        {hovered && (
          <HoverInformation
            item={{
              id: hovered.id,
              title: hovered.title,
              image: hovered.image,
              entityType: hovered.entityType,
              children: hovered.children,
            }}
            setHovered={setHovered}
          />
        )}
        
        {(user?.role === StaffType.SUPERADMIN ||
          user?.role === StaffType.MANAGER ||
          user?.role === StaffType.LANDSCAPE_ARCHITECT) && (
          <div className="absolute top-4 right-3 z-[1000]">
            <Tooltip title="Edit Boundaries">
              <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/zone/${zone.id}/edit-map`)}>
                Edit
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );
};

export default MapTab;
