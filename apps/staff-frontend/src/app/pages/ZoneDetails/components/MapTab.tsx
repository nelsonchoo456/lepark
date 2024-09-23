import {
  AttractionResponse,
  getAttractionsByParkId,
  getOccurrencesByParkId,
  getParkById,
  getZoneById,
  getZonesByParkId,
  OccurrenceResponse,
  ParkResponse,
  StaffResponse,
  StaffType,
  ZoneResponse,
} from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Checkbox, Space, Tooltip } from 'antd';
import { TbEdit, TbTicket, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { GetProp } from 'antd';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { COLORS } from '../../../config/colors';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { useAuth } from '@lepark/common-ui';

interface MapTabProps {
  zone: ZoneResponse;
}
const MapTab = ({ zone }: MapTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [park, setPark] = useState<ParkResponse>();

  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  const [attractions, setAttractions] = useState<AttractionResponse[]>();

  const [showPark, setShowPark] = useState<boolean>(true);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);

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

  // const fetchOccurrences = async () => {
  //   const occurrenceRes = await getOccurrences(park.id);
  //   if (occurrenceRes.status === 200) {
  //     const occurrenceData = occurrenceRes.data;
  //     setOccurrences(occurrenceData);
  //   }
  // }

  // const fetchAttractions = async () => {
  //   const attractionsRes = await getAttractionsByParkId(park.id);
  //   if (attractionsRes.status === 200) {
  //     const attractionsData = attractionsRes.data;
  //     setAttractions(attractionsData);
  //   }
  // }

  return (
    <>
      <Space className="mb-4">
        <div className="font-semibold">Display:</div>
        {park && (
          <Checkbox onChange={(e) => setShowPark(e.target.checked)} checked={showPark}>
            {park.name} (Park)
          </Checkbox>
        )}
        {/* <Checkbox onChange={(e) => setShowZones(e.target.checked)}>Zones</Checkbox> */}
        {/* <Checkbox onChange={(e) => setShowOccurrences(e.target.checked)}>Occurrences</Checkbox>
        <Checkbox onChange={(e) => setShowAttractions(e.target.checked)}>Attractions</Checkbox>
        <Checkbox onChange={(e) => setShowFacilities(e.target.checked)}>Facilities</Checkbox> */}
      </Space>
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {showPark && (
            <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.5 }} polygonLabel={park?.name} color="transparent" />
          )}
          <PolygonFitBounds geom={zone?.geom} polygonFields={{ fillOpacity: 0.9 }} polygonLabel={zone?.name} />

          {/* {showZones && zones &&
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
          {showOccurrences && occurrences &&
            occurrences.map((occurrence) => (
              <PictureMarker circleWidth={30} lat={occurrence.lat} lng={occurrence.lng} backgroundColor={COLORS.green[300]} icon={<PiPlantFill className='text-green-600 drop-shadow-lg' style={{ fontSize: "3rem" }}/>} tooltipLabel={occurrence.title} />
            ))}

          {showAttractions && attractions &&
            attractions.map((attraction) => (
              <PictureMarker circleWidth={30} lat={attraction.lat} lng={attraction.lng} backgroundColor={COLORS.sky[300]} icon={<TbTicket className='text-sky-600 drop-shadow-lg' style={{ fontSize: "3rem" }}/>} tooltipLabel={attraction.title} />
            ))} */}
        </MapContainer>
        
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
