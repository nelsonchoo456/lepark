import {
  AttractionResponse,
  getAttractionsByParkId,
  getOccurrencesByParkId,
  getZoneById,
  getZonesByParkId,
  OccurrenceResponse,
  ParkResponse,
  ZoneResponse,
  StaffResponse,
  StaffType,
  getFacilitiesByParkId,
  FacilityResponse,
  getEventsByParkId,
  EventResponse,
  FacilityWithEvents,
  getEventsByFacilityId,
  EventStatusEnum,
} from '@lepark/data-access';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonFitBounds from '../../../components/map/PolygonFitBounds';
import { Avatar, Button, Card, Checkbox, Collapse, Empty, Space, Tag, Tooltip, Typography } from 'antd';
import { TbEdit, TbLocation, TbTicket, TbTree } from 'react-icons/tb';
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
import HoverInformation, { HoverItem } from '../../../components/map/HoverInformation';
import { MdArrowOutward } from 'react-icons/md';
import ParkStatusTag from './ParkStatusTag';
import { BiSolidCalendar } from 'react-icons/bi';
import { capitalizeFirstLetter } from '../../../components/textFormatters/textFormatters';
import dayjs from 'dayjs';
import EventStatusTag from '../../EventDetails/components/EventStatusTag';
import { SCREEN_LG } from '../../../config/breakpoints';

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

  const [showZones, setShowZones] = useState<boolean>(false);
  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState<boolean>(false);
  const [showEvents, setShowEvents] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);

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

      console.log(Object.values(facilityMap));
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

  return (
    <>
      <Card styles={{ body: { padding: 0 } }} className="px-4 py-2 mb-4">
        <Space size={16} className='flex-wrap'>
          <div className="font-semibold">Display:</div>
          <Checkbox onChange={(e) => setShowZones(e.target.checked)} checked={showZones} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            Zones
          </Checkbox>
          <Checkbox onChange={(e) => setShowOccurrences(e.target.checked)} checked={showOccurrences} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            Occurrences
          </Checkbox>
          <Checkbox onChange={(e) => setShowAttractions(e.target.checked)} checked={showAttractions} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            Attractions
          </Checkbox>
          <Checkbox onChange={(e) => setShowEvents(e.target.checked)} checked={showEvents} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            Events
          </Checkbox>
          <Checkbox onChange={(e) => setShowFacilities(e.target.checked)} checked={showFacilities} className='border-gray-200 border-[1px] px-4 py-1 rounded-full'>
            Facilities
          </Checkbox>
        </Space>
      </Card>
      <div
        style={{
          height: `${webMode ? '60vh' : '80vh'}`,
          position: 'relative',
        }}
        className="rounded-xl md:overflow-hidden"
      >
        <MapContainer
          key="park-map-tab"
          center={[1.287953, 103.851784]}
          zoom={11}
          className="leaflet-mapview-container h-full w-full"
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
                        <ParkStatusTag>{attraction.status}</ParkStatusTag>
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

          {showFacilities &&
            facilities &&
            facilities.map(
              (facility) =>
                facility.lat &&
                facility.long && (
                  <FacilityPictureMarker
                    id={facility.id}
                    circleWidth={38}
                    lat={facility.lat}
                    lng={facility.long}
                    innerBackgroundColor={COLORS.sky[400]}
                    tooltipLabel={facility.facilityName}
                    facilityType={facility.facilityType}
                    hovered={hovered}
                    setHovered={() =>
                      setHovered({
                        ...facility,
                        title: facility.facilityName,
                        image: facility.images ? facility.images[0] : null,
                        entityType: 'FACILITY',
                        children: (
                          <div className="h-full w-full flex flex-col justify-between">
                            <div className="flex justify-between flex-wrap mb-2">
                              <p className="">{capitalizeFirstLetter(facility.facilityType)}</p>
                              <ParkStatusTag>{facility.facilityStatus}</ParkStatusTag>
                            </div>

                            <div className="">
                              <div className="flex w-full items-center mb-2">
                                <div className="font-semibold text-sky-400 mr-2">Upcoming Events</div>
                                <div className="flex-[1] h-[1px] bg-sky-400/30" />
                              </div>
                              <div className="h-42 flex gap-2 pb-3 overflow-x-scroll flex-nowrap">
                                {facility.events.map((event) => (
                                  <div
                                    className="bg-gray-50/40 h-full w-36 rounded overflow-hidden flex-shrink-0 cursor-pointer shadow hover:text-sky-400"
                                  >
                                    <Tooltip title="View Event Details">
                                      <div onClick={() => navigate(`/event/${event.id}`)}>
                                        <div
                                          style={{
                                            backgroundImage: `url('${event.images && event.images.length > 0 ? event.images[0] : ''}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                          }}
                                          className="rounded-b-lg h-18 w-full shadow-md text-white flex-0 flex items-center justify-center  bg-sky-200 opacity-50 overflow-hidden"
                                        >
                                          {(!event.images || event.images.length === 0) && (
                                            <BiSolidCalendar className="opacity-75 text-lg" />
                                          )}
                                        </div>
                                        <div className="font-semibold px-2 mt-1">{event.title}</div>
                                        <div className="text-xs px-2">
                                          {dayjs(event?.startDate).format('D MMM') + ' - ' + dayjs(event?.endDate).format('D MMM')}
                                        </div>
                                      </div>
                                    </Tooltip>
                                    <div className="flex justify-end mb-2 px-2">
                                      <Tooltip title="View on Map">
                                        <Button
                                          shape="circle"
                                          icon={<TbLocation />}
                                          onClick={() =>{
                                            setShowEvents(true);
                                            setHovered({
                                              ...event,
                                              title: (
                                                <div className="flex justify-between items-center">
                                                  {event.title}
                                                  <EventStatusTag status={event?.status as EventStatusEnum} />
                                                </div>
                                              ),
                                              image: event.images ? event.images[0] : null,
                                              entityType: 'EVENT',
                                              children: (
                                                <div className="h-full w-full flex flex-col justify-between">
                                                  <div>
                                                    <Typography.Paragraph
                                                      ellipsis={{
                                                        rows: 3,
                                                      }}
                                                    >
                                                      {event.description}
                                                    </Typography.Paragraph>
                                                    <div className="-mt-2 ">
                                                      <span className="text-secondary">Date: </span>
                                                      {dayjs(event?.startDate).format('D MMM YYYY') +
                                                        ' - ' +
                                                        dayjs(event?.endDate).format('D MMM YYYY')}
                                                    </div>
                                                    <div>
                                                      <span className="text-secondary">Time:</span>
                                                      <Tag bordered={false}>{dayjs(event?.startDate).format('h:mm A')}</Tag>-{' '}
                                                      <Tag bordered={false}>{dayjs(event?.endDate).format('h:mm A')}</Tag> daily
                                                    </div>
                                                    <Tooltip title="View Facility details" placement="topLeft">
                                                      <p
                                                        className="text-green-500 cursor-pointer font-semibold hover:text-green-900"
                                                        onClick={() => navigate(`/facilities/${facility.id}`)}
                                                      >
                                                        @ {facility.facilityName}
                                                      </p>
                                                    </Tooltip>
                                                  </div>
                                                  <div className="flex justify-end">
                                                    <Tooltip title="View Event details">
                                                      <Button shape="circle" onClick={() => navigate(`/event/${event.id}`)}>
                                                        <MdArrowOutward />
                                                      </Button>
                                                    </Tooltip>
                                                  </div>
                                                </div>
                                              ),
                                            })
                                          }}
                                        />
                                      </Tooltip>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex w-full items-center mb-2">
                                <div className="flex-[1] h-[1px] bg-sky-400/30" />
                              </div>
                            </div>
                            {/* <Collapse
                              bordered={false}
                              defaultActiveKey={[]}
                              size="small"
                              expandIconPosition="end"
                              className="mb-2"
                              items={facility.events.map((event, index) => ({
                                key: `${index}`,
                                label: (
                                  <div className='flex items-center gap-2'>
                                    <div
                                      style={{
                                        backgroundImage: `url('${event.images && event.images.length > 0 ? event.images[0] : ''}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                      }}
                                      className="rounded-full h-8 w-8 shadow-md text-white flex-0 flex items-center justify-center  bg-gray-400 overflow-hidden"
                                    >
                                      {(!event.images || event.images.length === 0) && <BiSolidCalendar className='opacity-75 text-lg'/>}
                                    </div>
                                    {event.title}
                                  </div>
                                ),
                                children: 'keke',
                              }))}
                            /> */}
                            <div className="flex justify-end">
                              <Tooltip title="View Facility details">
                                <Button shape="circle" onClick={() => navigate(`/facility/${facility.id}`)}>
                                  <MdArrowOutward />
                                </Button>
                              </Tooltip>
                            </div>
                          </div>
                        ),
                      })
                    }
                  />
                ),
            )}

          {showEvents &&
            facilityEvents &&
            facilityEvents.map(
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
