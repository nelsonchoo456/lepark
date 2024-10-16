import {
  AttractionResponse,
  getAttractionsByParkId,
  getOccurrencesByParkId,
  getZonesByParkId,
  OccurrenceResponse,
  ParkResponse,
  ZoneResponse,
  StaffResponse,
  StaffType,
  getFacilitiesByParkId,
  getEventsByParkId,
  EventResponse,
  FacilityWithEvents,
  getEventsByFacilityId,
  getDecarbonizationAreasByParkId,
  DecarbonizationAreaResponse,
  getOccurrencesWithinDecarbonizationArea,
} from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Button, Card, Checkbox, Space, Tooltip, Typography } from 'antd';
import { TbEdit, TbTicket, TbTree } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { COLORS } from '../../../config/colors';
import PictureMarker from '../../../components/map/PictureMarker';
import { PiPlantFill } from 'react-icons/pi';
import { useAuth } from '@lepark/common-ui';
import FacilityEventsPictureMarker from '../../../components/map/FacilityEventsPictureMarker';
import HoverInformation, { HoverItem } from '../../../components/map/HoverInformation';
import { MdArrowOutward } from 'react-icons/md';
import ParkStatusTag from './ParkStatusTag';
import { SCREEN_LG } from '../../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { parseGeom } from '../../DecarbonizationAreaDetails/components/MapTab';

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
  const [facilities, setFacilities] = useState<FacilityWithEvents[]>();
  const [decarbAreas, setDecarbAreas] = useState<(DecarbonizationAreaResponse & { occurrences?: OccurrenceResponse[] })[]>();

  const [showZones, setShowZones] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);
  const [showDecarb, setShowDecarb] = useState<boolean>(false);

  const [hovered, setHovered] = useState<HoverItem | null>(null); // Shared hover state
  
  const [webMode, setWebMode] = useState<boolean>(
    window.innerWidth >= SCREEN_LG
  );

  useEffect(() => {
    const handleResize = () => {
      setWebMode(window.innerWidth >= SCREEN_LG);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (park.id) {
      fetchZones();
      fetchOccurrences();
      fetchAttractions();
      fetchEvents();
      fetchFacilities();
      fetchDecarbonisationAreas();
    }
  }, [park]);

  const fetchZones = async () => {
    const zonesRes = await getZonesByParkId(park.id);
    if (zonesRes.status === 200) {
      const zonesData = zonesRes.data;
      setZones(zonesData);
    }
  };

  const fetchOccurrences = async () => {
    const occurrenceRes = await getOccurrencesByParkId(park.id);
    if (occurrenceRes.status === 200) {
      const occurrenceData = occurrenceRes.data;
      setOccurrences(occurrenceData);
    }
  };

  const fetchAttractions = async () => {
    const attractionsRes = await getAttractionsByParkId(park.id);
    if (attractionsRes.status === 200) {
      const attractionsData = attractionsRes.data;
      setAttractions(attractionsData);
    }
  };

  const fetchEvents = async () => {
    const eventsRes = await getEventsByParkId(park.id);
    if (eventsRes.status === 200) {
      const eventsData = eventsRes.data;

      const facilityMap: Record<string, any> = {};

      eventsData.forEach((event) => {
        const { facility, ...restEvent } = event;
        const facilityId = event.facilityId;

        if (!facilityMap[facilityId]) {
          facilityMap[facilityId] = {
            ...event.facility,
            events: [{ ...restEvent }],
          };
        } else {
          facilityMap[facilityId].events.push(restEvent);
        }
      });
      setFacilityEvents(Object.values(facilityMap));
    }
  };

  const fetchFacilities = async () => {
    const facilitiesRes = await getFacilitiesByParkId(park.id);
    if (facilitiesRes.status === 200) {
      const facilitiesData = facilitiesRes.data;
      const facilitiesWithEvents = await Promise.all(
        facilitiesData.map(async (facility) => {
          const { events, ...restFacility } = facility;
          const facilityWithEvents: FacilityWithEvents = { ...restFacility, events: [] };
          try {
            const eventsRes = await getEventsByFacilityId(facility.id);

            if (eventsRes.status === 200) {
              facilityWithEvents.events = eventsRes.data; // Append events to the facility
            }
            return facilityWithEvents;
          } catch (error) {
            return facilityWithEvents;
          }
        }),
      );
      setFacilities(facilitiesWithEvents);
    }
  };

  const fetchDecarbonisationAreas = async () => {
    const decarbRes = await getDecarbonizationAreasByParkId(park.id);
    if (decarbRes.status === 200) {
      const decarbData = decarbRes.data;
      setDecarbAreas(decarbData);
      const decarbWithOccurrences = await Promise.all(
        decarbData.map(async (decarb) => {
          try {
            const occurrencesRes = await getOccurrencesWithinDecarbonizationArea(decarb.id);

            return { ...decarb, occurrences: occurrencesRes.data }; // Append events to the facility
          } catch (error) {
            return { ...decarb, occurrences: [] };
          }
        }),
      );
      console.log(decarbWithOccurrences)
      setDecarbAreas(decarbWithOccurrences);
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
          <Checkbox
            onChange={(e) => setShowDecarb(e.target.checked)}
            checked={showDecarb}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Decarbonization Areas
          </Checkbox>
          <Checkbox
            onChange={(e) => setShowOccurrences(e.target.checked)}
            checked={showOccurrences}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Occurrences
          </Checkbox>
          <Checkbox
            onChange={(e) => setShowAttractions(e.target.checked)}
            checked={showAttractions}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Attractions
          </Checkbox>
          <Checkbox
            onChange={(e) => setShowEvents(e.target.checked)}
            checked={showEvents}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Events
          </Checkbox>
          <Checkbox
            onChange={(e) => setShowFacilities(e.target.checked)}
            checked={showFacilities}
            className="border-gray-200 border-[1px] px-4 py-1 rounded-full"
          >
            Facilities
          </Checkbox>
        </Space>
      </Card>
      <div
        style={{
          height: `${webMode ? '80vh' : '80vh'}`,
          position: 'relative',
        }}
        className="rounded-xl md:overflow-hidden"
      >
        <MapContainer key="park-map-tab" center={[1.287953, 103.851784]} zoom={11} className="leaflet-mapview-container h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <PolygonFitBounds geom={park?.geom} polygonFields={{ fillOpacity: 0.4, opacity: 0 }} />
          {showDecarb &&
            decarbAreas &&
            decarbAreas.map((decarb) => (
              <PolygonWithLabel
                key={decarb.id}
                entityId={decarb.id}
                geom={parseGeom(decarb.geom)}
                polygonLabel={<div className="flex items-center gap-2 text-highlightGreen-600">{decarb.name}</div>}
                color={`transparent`}
                fillColor={COLORS.highlightGreen[200]}
                labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
                handlePolygonClick={() =>
                  setHovered({
                    id: decarb.id,
                    image: park && park.images && park.images.length > 0 ? park.images[0] : null,
                    title: (
                      <div className="flex justify-between items-center w-full">
                        <div>{decarb.name}</div>
                        <Tooltip title="View Details">
                          <Button icon={<MdArrowOutward />} shape="circle" type="primary" onClick={() => navigate(`/decarbonization-area/${decarb.id}`)}/>
                        </Tooltip>
                      </div>
                    ),
                    entityType: 'DECARBONIZATION',
                    children: decarb.occurrences ? (
                      <div className="text-green-600">
                        Number of Occurrences: <strong>{decarb.occurrences.length}</strong>
                      </div>
                    ) : (
                      <div className="text-green-600 opacity-50 italic">No occurrences</div>
                    ),
                  })
                }
              />
            ))}

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
                // color={COLORS.green[600]}
                color={`transparent`}
                fillColor={COLORS.green[200]}
                labelFields={{ color: COLORS.green[800], textShadow: 'none' }}
              />
            ))}

          {showOccurrences &&
            occurrences &&
            occurrences.map((occurrence) => (
              <PictureMarker
                id={occurrence.id}
                entityType="OCCURRENCE"
                circleWidth={30}
                lat={occurrence.lat}
                lng={occurrence.lng}
                backgroundColor={COLORS.green[300]}
                icon={<PiPlantFill className="text-green-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                tooltipLabel={occurrence.title}
                hovered={hovered}
                setHovered={() =>
                  setHovered({
                    ...occurrence,
                    image: occurrence.images ? occurrence.images[0] : null,
                    entityType: 'OCCURRENCE',
                    children: (
                      <div className="h-full w-full flex flex-col justify-between">
                        <div>
                          <p className="italic text-secondary">{occurrence.speciesName}</p>
                          <Tooltip title="View Zone details" placement="topLeft">
                            <p
                              className="text-green-600 cursor-pointer hover:text-green-900"
                              onClick={() => navigate(`/zone/${occurrence.zoneId}`)}
                            >
                              @ {occurrence.zoneName}
                            </p>
                          </Tooltip>
                        </div>
                        <div className="flex justify-end">
                          <Tooltip title="View Occurrence details">
                            <Button shape="circle" onClick={() => navigate(`/occurrences/${occurrence.id}`)}>
                              <MdArrowOutward />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    ),
                  })
                }
              />
            ))}

          {showAttractions &&
            attractions &&
            attractions.map((attraction) => (
              <PictureMarker
                id={attraction.id}
                entityType="ATTRACTION"
                circleWidth={30}
                lat={attraction.lat}
                lng={attraction.lng}
                backgroundColor={COLORS.mustard[300]}
                icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
                tooltipLabel={attraction.title}
                hovered={hovered}
                setHovered={() =>
                  setHovered({
                    ...attraction,
                    title: (
                      <div className="flex justify-between items-center">
                        {attraction.title}
                        <ParkStatusTag>{formatEnumLabelToRemoveUnderscores(attraction.status)}</ParkStatusTag>
                      </div>
                    ),
                    image: attraction.images ? attraction.images[0] : null,
                    entityType: 'ATTRACTION',
                    children: (
                      <div className="h-full w-full flex flex-col justify-between">
                        <div>
                          <Typography.Paragraph
                            ellipsis={{
                              rows: 3,
                            }}
                          >
                            {attraction.description}
                          </Typography.Paragraph>
                        </div>
                        <div className="flex justify-end">
                          <Tooltip title="View Attraction details">
                            <Button shape="circle" onClick={() => navigate(`/attraction/${attraction.id}`)}>
                              <MdArrowOutward />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    ),
                  })
                }
              />
            ))}

          {(showFacilities || showEvents) &&
            facilities &&
            facilities.map(
              (facility) =>
                facility.lat &&
                facility.long && (
                  <FacilityEventsPictureMarker
                    facility={{ ...facility, events: [] }}
                    circleWidth={38}
                    events={facility.events}
                    lat={facility.lat}
                    lng={facility.long}
                    facilityType={facility.facilityType}
                    showEvents={showEvents}
                    showFacilities={showFacilities}
                    setShowEvents={setShowEvents}
                    hovered={hovered}
                    setHovered={setHovered}
                  />
                ),
            )}
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
