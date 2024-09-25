import { AttractionResponse, getAttractionsByParkId, getOccurrencesByParkId, getZoneById, getZonesByParkId, OccurrenceResponse, ParkResponse, ZoneResponse, StaffResponse, StaffType, getFacilitiesByParkId, FacilityResponse, getEventsByParkId, EventResponse, FacilityWithEvents } from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Avatar, Button, Card, Checkbox, Space, Tooltip } from 'antd';
import { TbEdit, TbTicket, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { GetProp } from 'antd';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { COLORS } from '../../../config/colors';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { useAuth } from '@lepark/common-ui';
import { FaFemale, FaMale } from 'react-icons/fa';
import FacilityPictureMarker from '../../../components/map/FacilityPictureMarker';
import FacilityEventsPictureMarker from '../../../components/map/FacilityEventsPictureMarker';

interface MapTabProps {
  park: ParkResponse;
}
const MapTab = ({ park }: MapTabProps) => {
  const { user } = useAuth<StaffResponse>();
  const navigate = useNavigate();
  const [zones, setZones] = useState<ZoneResponse[]>();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  const [attractions, setAttractions] = useState<AttractionResponse[]>();
  const [events, setEvents] = useState<EventResponse[]>();
  const [facilityEvents, setFacilityEvents] = useState<FacilityWithEvents[]>();
  const [facilities, setFacilities] = useState<FacilityResponse[]>();

  const [showZones, setShowZones] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);

  useEffect(() => {
    if (park.id) {
      fetchZones();
      fetchOccurrences();
      fetchAttractions();
      fetchEvents();
      fetchFacilities();
    }
  }, [park])

  const fetchZones = async () => {
    const zonesRes = await getZonesByParkId(park.id);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  }
  
  const fetchOccurrences = async () => {
    const occurrenceRes = await getOccurrencesByParkId(park.id);
    if (occurrenceRes.status === 200) {
      const occurrenceData = occurrenceRes.data;
      setOccurrences(occurrenceData);
    }
  }

  const fetchAttractions = async () => {
    const attractionsRes = await getAttractionsByParkId(park.id);
    if (attractionsRes.status === 200) {
      const attractionsData = attractionsRes.data;
      setAttractions(attractionsData);
    }
  }

  const fetchEvents = async () => {
    const eventsRes = await getEventsByParkId(park.id);
    if (eventsRes.status === 200) {
      const eventsData = eventsRes.data;

      const facilityMap: Record<string, any> = {};

      eventsData.forEach(event => {
        const { facility, ...restEvent } = event
        const facilityId = event.facilityId;

        if (!facilityMap[facilityId]) {
          facilityMap[facilityId] = {
            ...event.facility,
            events: [{...restEvent}],
          };
        } else {
          facilityMap[facilityId].events.push(restEvent);
        }
      });

      console.log(Object.values(facilityMap))
      setFacilityEvents(Object.values(facilityMap))
      // setEvents(eventsData);
    }

    

    
  }

  const fetchFacilities = async () => {
    const facilitiesRes = await getFacilitiesByParkId(park.id);
    if (facilitiesRes.status === 200) {
      const facilitiesData = facilitiesRes.data;
      setFacilities(facilitiesData);
    }
  }

  return (
    <>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-3 mb-4">
        <Space size={20}>
          <div className="font-semibold">Display:</div>
          <Checkbox onChange={(e) => setShowZones(e.target.checked)} checked={showZones}>
            Zones
          </Checkbox>
          <Checkbox onChange={(e) => setShowOccurrences(e.target.checked)} checked={showOccurrences}>
            Occurrences
          </Checkbox>
          <Checkbox onChange={(e) => setShowAttractions(e.target.checked)} checked={showAttractions}>
            Attractions
          </Checkbox>
          <Checkbox onChange={(e) => setShowEvents(e.target.checked)} checked={showEvents}>
            Events
          </Checkbox>
          <Checkbox onChange={(e) => setShowFacilities(e.target.checked)} checked={showFacilities}>
            Facilities
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
          style={{ height: '100%', width: '100%' }}
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
          {showOccurrences &&
            occurrences &&
            occurrences.map((occurrence) => (
              <PictureMarker
                circleWidth={30}
                lat={occurrence.lat}
                lng={occurrence.lng}
                backgroundColor={COLORS.green[300]}
                icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                tooltipLabel={occurrence.title}
              />
            ))}

          {showAttractions &&
            attractions &&
            attractions.map((attraction) => (
              <PictureMarker
                circleWidth={30}
                lat={attraction.lat}
                lng={attraction.lng}
                backgroundColor={COLORS.mustard[300]}
                icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                tooltipLabel={attraction.title}
              />
            ))}

          

          {showFacilities && !showEvents &&
            facilities &&
            facilities.map(
              (facility) =>
                facility.lat &&
                facility.long && (
                  <FacilityPictureMarker
                    circleWidth={38}
                    lat={facility.lat}
                    lng={facility.long}
                    innerBackgroundColor={COLORS.sky[400]}
                    tooltipLabel={facility.facilityName}
                    facilityType={facility.facilityType}
                  />
                ),
            )}

          {/* {showEvents &&
            events &&
            events.map((event) => (
              event.facility?.lat &&
              event.facility?.long &&
              <PictureMarker
                circleWidth={30}
                lat={event.facility.lat}
                lng={event.facility.long}
                backgroundColor={COLORS.mustard[300]}
                icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                tooltipLabel={event.title}
              />
            ))}  */}

          {showEvents &&
            facilityEvents &&
            facilityEvents.map((facility) => (
              facility.lat &&
              facility.long &&
              <FacilityEventsPictureMarker
                circleWidth={38}
                events={facility.events}
                lat={facility.lat}
                lng={facility.long}
                facilityType={facility.facilityType}
                // tooltipLabel={facility.facilityName}
              />
            ))} 
        </MapContainer>

        {(user?.role === StaffType.SUPERADMIN || user?.role === StaffType.MANAGER || user?.role === StaffType.LANDSCAPE_ARCHITECT) && (
          <div className="absolute top-4 right-3 z-[1000]">
            <Tooltip title="Edit Boundaries">
              <Button icon={<TbEdit />} type="primary" onClick={() => navigate(`/park/${park.id}/edit-map`)}>
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
