import {
  AttractionResponse,
  FacilityResponse,
  FacilityTypeEnum,
  FacilityWithEvents,
  getZonesByParkId,
  ParkResponse,
  ZoneResponse,
} from '@lepark/data-access';
import { useEffect, useMemo, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { Button, Dropdown, Empty, Select, Tooltip, Typography, Menu, Checkbox, Popover, Col, Space, CheckboxProps, Tag } from 'antd';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { HiOutlineBuildingLibrary } from 'react-icons/hi2';
import { FaFilter, FaLandmark, FaStar, FaTent, FaTicket } from 'react-icons/fa6';
import { useFetchMarkersByZoneGroup } from '../../../components/map/hooks/useFetchMarkersByZoneGroup';
import { HoverItem } from '../../../components/map/interfaces/interfaces';
import PictureMarker from '../../../components/map/PictureMarker';
import { TbTicket } from 'react-icons/tb';
import { COLORS } from '../../../config/colors';
import { MdArrowOutward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import FacilityEventsPictureMarker from '../../../components/map/FacilityEventsPictureMarker';
import { useFetchMarkersByParkGroup } from '../../../components/map/hooks/useFetchMarkersByParkGroup';
import { useMap } from 'react-leaflet';
import MarkerLabel from '../../../components/map/MarkerLabel';
import { BiSolidCalendarEvent, BiSolidLandmark } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import UserLiveLocationMap from '../../../components/map/userLocation/UserLiveLocation';
import { PiPlantFill, PiStar, PiStarFill } from 'react-icons/pi';
import { image } from 'html2canvas/dist/types/css/types/image';
import { IoLeafSharp } from 'react-icons/io5';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import dayjs from 'dayjs';
import { calculateDistance } from '../../../components/map/functions/functions';

interface OneZoneProps {
  zone: ZoneResponse;
  setHovered: any;
}

interface ZonesProps {
  park: ParkResponse;
}

interface MarkersHandlerProps {
  park: ParkResponse;
  attractions?: AttractionResponse[];
  facilities?: FacilityWithEvents[];
  facilityEvents?: FacilityWithEvents[];
  showOccurrences?: boolean;
  showAttractions?: boolean;
  showFacilities?: boolean;
  showEvents?: boolean;
  setShowEvents?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAttractions?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFacilities?: React.Dispatch<React.SetStateAction<boolean>>;
  hovered?: HoverItem | null;
  setHovered?: any;
}

const filteredTypes = [
  'TOILET',
  'PLAYGROUND',
  'INFORMATION',
  'CARPARK',
  'ACCESSIBILITY',
  'STAGE',
  'WATER_FOUNTAIN',
  'PICNIC_AREA',
  'BBQ_PIT',
  'CAMPING_AREA',
  'FIRST_AID',
  'AMPHITHEATER',
  'GAZEBO',
];

interface MarkersGroupProps {
  attractions?: AttractionResponse[];
  facilities?: FacilityWithEvents[];
  facilityEvents?: FacilityWithEvents[];

  hovered?: HoverItem | null;
  setHovered?: React.Dispatch<React.SetStateAction<HoverItem | null>>;

  showOccurrences?: boolean;
  showAttractions?: boolean;
  showFacilities?: boolean;
  showEvents?: boolean;

  setShowEvents?: (show: boolean) => void;

  zoomLevel?: number;
  selectedFacilityTypes?: string[],

  userLat?:number;
  userLng?:number;
}

interface InformationProps {
  hoverItem: HoverItem;
  setHovered: (hover: any) => void;
}

export const isOpen = (openingHours: any, closingHours: any[]) => {
  const now = dayjs();
  const currentDay = now.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  const openingTime = dayjs(openingHours[currentDay]).format('HH:mm');
  let closingTime = dayjs(closingHours[currentDay]).format('HH:mm');
  if (closingTime === '00:00') {
    closingTime = '24:00';
  }

  const currentTime = now.format('HH:mm');

  // return now.isAfter(openingTime) && now.isBefore(closingTime);
  return currentTime >= openingTime && currentTime <= closingTime;
};

// -- [ LAYER 1 ] --
// Zones all
const Zones = ({ park }: ZonesProps) => {
  const [zones, setZones] = useState<ZoneResponse[]>();
  // const [hovered, setHovered] = useState<HoverItem>();
  const {
    attractions,
    facilities,
    facilityEvents,
    showAttractions,
    setShowAttractions,
    showFacilities,
    setShowFacilities,
    showEvents,
    setShowEvents,
    hovered,
    setHovered,
  } = useFetchMarkersByParkGroup({ park });

  useEffect(() => {
    if (park) {
      fetchZones(park.id);
    }
  }, [park]);

  const fetchZones = async (parkId: number) => {
    try {
      const zonesRes = await getZonesByParkId(parkId);
      if (zonesRes.status === 200) {
        setZones(zonesRes.data);
      }
    } catch (e) {
      setZones([]);
    }
  };

  const setHoveredZone = (zone: ZoneResponse) => {
    setHovered({
      id: '' + zone.id,
      title: zone.name,
      image: zone.images ? zone.images[0] : null,
      entityType: 'ZONE',
      children: (
        <div className="h-full w-full flex flex-col justify-between">
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{zone.description}</Typography.Paragraph>
        </div>
      ),
    });
  };

  return (
    <>
      {zones?.map((z) => (
        <OneZone zone={z} setHovered={() => setHoveredZone(z)} />
      ))}{' '}
      <MarkersHandlers
        park={park}
        attractions={attractions}
        facilities={facilities}
        facilityEvents={facilityEvents}
        showAttractions={showAttractions}
        setShowAttractions={setShowAttractions}
        setShowEvents={setShowEvents}
        showFacilities={showFacilities}
        setShowFacilities={setShowFacilities}
        showEvents={showEvents}
        hovered={hovered}
        setHovered={setHovered}
      />
      {hovered && <Information hoverItem={hovered} setHovered={setHovered}></Information>}
    </>
  );
};

// -- [ LAYER 2b ] --
// Zone
const OneZone = ({ zone, setHovered }: OneZoneProps) => {
  return (
    <PolygonWithLabel
      entityId={zone.id}
      geom={zone.geom}
      color="transparent"
      fillOpacity={0.5}
      polygonLabel={zone.name}
      labelFields={{ fontSize: '14px' }}
      handlePolygonClick={() => setHovered()}
    />
  );
};

// -- [ LAYER 2a ] --
// Handlers for Attractions, Events, Facilities
const MarkersHandlers = ({
  park,

  attractions,
  facilities,
  facilityEvents,
  showAttractions,
  setShowAttractions,
  showFacilities,
  setShowFacilities,
  showEvents,
  setShowEvents,

  hovered,
  setHovered,
}: MarkersHandlerProps) => {
  const map = useMap(); // Access the map instance
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>([]);

  const searchOptions = useMemo(
    () => [
      ...(attractions || []).map((item) => ({
        label: <div className="bg-mustard-100 px-1 rounded">{item.title}</div>,
        value: `attraction_${item.id}`,
        searchVal: `${item.title.toLowerCase()}-attraction`,
      })),
      ...(facilities || []).map((item) => ({
        label: <div className="bg-sky-100 px-1 rounded">{item.name}</div>,
        value: `facility_${item.id}`,
        searchVal: `${item.name.toLowerCase()}-${item.facilityType.toLowerCase()}-facility`,
      })),
      ...(facilities || []).flatMap((fac) =>
        fac.events.map((event) => ({
          label: <div className="bg-highlightGreen-100 px-1 rounded">{event.title}</div>,
          value: `event_${event.id}`,
          searchVal: `${event.title.toLowerCase()}-${fac.name.toLowerCase()}-${fac.facilityType.toLowerCase()}-event`,
        })),
      ),
    ],
    [attractions, facilities, facilityEvents],
  );

  const [filteredOptions, setFilteredOptions] = useState(searchOptions);

  const handleSelect = (value: string) => {
    const [type, id] = value.split('_');

    const selectedMarker: any =
      attractions?.find((attraction) => attraction.id === id) ||
      facilities?.find((facility) => facility.id === id) ||
      facilityEvents?.flatMap((facility) => facility.events).find((event) => event.id === id);

    if (selectedMarker) {
      switch (type) {
        case 'attraction':
          map.setView([selectedMarker.lat, selectedMarker.lng], 18);
          // navigate(`/attraction/${id}`);
          break;
        case 'facility':
          setSelectedFacilityTypes([])
          map.setView([selectedMarker.lat, selectedMarker.long], 18);
          // navigate(`/facility/${id}`);
          break;
        case 'event':
          map.setView([selectedMarker.lat, selectedMarker.lng], 18);
          // navigate(`/event/${id}`);
          break;
        default:
          break;
      }
    }
  };

  const handleSearch = (value: string) => {
    const filtered = searchOptions.filter((option) => option.searchVal.includes(value.trim().toLowerCase()));
    setFilteredOptions(filtered);
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 60000,
          timeout: 60000,
        },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    const handleZoom = () => {
      setZoomLevel(map.getZoom());
    };

    map.on('zoom', handleZoom); // Listen to zoom changes
    return () => {
      map.off('zoom', handleZoom); // Cleanup listener
    };
  }, [map]);
  
  // Dropdown menu for facility types
  const facilityTypeMenu = () => {
    return (
      <Checkbox.Group defaultValue={[]} value={selectedFacilityTypes}>
        <Space direction="vertical">
          {filteredTypes.map((type) => {
            return (
            <Checkbox key={type} value={type} onChange={() => toggleFacilityType(type)}>
              {formatEnumLabelToRemoveUnderscores(type)}
            </Checkbox>
          )})}
        </Space>
        {/* </Col> */}
      </Checkbox.Group>
    );
  };

  // Toggle facility type selection
  const toggleFacilityType = (type: string) => {
    if (setShowFacilities) { setShowFacilities(true) }
    setSelectedFacilityTypes(
      (prev) =>
        prev.includes(type)
          ? prev.filter((t) => t !== type) // Remove if already selected
          : [...prev, type], // Add if not selected
    );
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 400,
          width: '100%',
          padding: '0 1rem 0 3.6rem',
        }}
      >
        <Select
          onSearch={handleSearch}
          onSelect={handleSelect}
          showSearch
          defaultActiveFirstOption={false}
          suffixIcon={<FiSearch />}
          filterOption={false}
          options={filteredOptions}
          className="w-full"
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '3.5rem',
          right: '1rem',
          zIndex: 400,
        }}
      >
        <div className="flex flex-col items-end justify-end mt-2 gap-2">
          <div className="flex">
            <div
              key={'facilities-vis'}
              onClick={() => setShowFacilities && setShowFacilities((prev) => !prev)}
              className={`flex flex-col items-center text-white w-16 py-2 rounded-l-md ${showFacilities ? 'bg-sky-400' : 'bg-sky-200'}`}
            >
              <FaTent />
              <div style={{ fontSize: '0.7rem' }}>Facilities</div>
            </div>
            <Popover content={facilityTypeMenu()} trigger="click">
              <div
                key={'facilities-vis'}
                className={`flex flex-col items-center justify-center text-center text-white px-2 h-full py-2 rounded-r-md ${
                  showFacilities ? 'bg-sky-300' : 'bg-sky-200'
                }`}
              >
                <FaFilter/>
              </div>{' '}
            </Popover> 
          </div>
          <div
            key={'attractions-vis'}
            onClick={() => setShowAttractions && setShowAttractions((prev) => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showAttractions === true ? 'bg-mustard-400' : 'bg-mustard-200'
            }`}
          >
            <BiSolidLandmark />
            <div style={{ fontSize: '0.7rem' }}>Attractions</div>
          </div>
          <div
            key={'events-vis'}
            onClick={() => setShowEvents && setShowEvents((prev) => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showEvents ? 'bg-highlightGreen-400' : 'bg-highlightGreen-200'
            }`}
          >
            <PiStarFill />
            <div style={{ fontSize: '0.7rem' }}>Events</div>
          </div>
        </div>
      </div>
      {lat && lng && zoomLevel && zoomLevel > 14 && (
        <>
          <MarkerLabel
            lat={lat}
            lng={lng}
            entityId={'user-loc'}
            fillColor={'#33d6d6'}
            textColor={'white'}
            label={'You are here!'}
            fillOpacity={99}
          />
          <UserLiveLocationMap />
        </>
      )}

      <MarkersGroup
        attractions={attractions}
        facilities={facilities}
        facilityEvents={facilityEvents}
        hovered={hovered}
        setHovered={setHovered}
        showAttractions={showAttractions}
        showFacilities={showFacilities}
        showEvents={showEvents}
        setShowEvents={setShowEvents}
        zoomLevel={zoomLevel}
        selectedFacilityTypes={selectedFacilityTypes}
        userLat={lat}
        userLng={lng}
      />
    </>
  );
};

// -- [ LAYER 3 ] --
// Markers for Attractions, Events, Facilities
const MarkersGroup = ({
  attractions,
  facilities,
  facilityEvents,
  hovered,
  setHovered,
  showAttractions,
  showFacilities,
  showEvents,
  setShowEvents,
  zoomLevel,
  selectedFacilityTypes,
  userLat,
  userLng
}: MarkersGroupProps) => {
  const now = dayjs();
  const currentDay = now.day();
  const navigate = useNavigate();
  const map = useMap();

  const zoom = (lat: number, lng: number) => {
    map.setView([lat, lng], 18);
  };

  const showFacilityBasedOnType = (facility: FacilityWithEvents) => {
    if (!selectedFacilityTypes || selectedFacilityTypes.length === 0) {
      return true;
    }
    return selectedFacilityTypes?.includes(facility.facilityType)
  }

  return (
    <>
      {showAttractions &&
        attractions &&
        attractions.map((attraction) => (
          <>
            {zoomLevel && zoomLevel > 16 && (
              <MarkerLabel
                lat={attraction.lat}
                lng={attraction.lng}
                entityId={attraction.id}
                fillColor={COLORS.mustard[200]}
                textColor={COLORS.mustard[700]}
                label={attraction.title}
              />
            )}
            <PictureMarker
              key={attraction.id}
              id={attraction.id}
              entityType="ATTRACTION"
              circleWidth={30}
              lat={attraction.lat}
              lng={attraction.lng}
              backgroundColor={COLORS.mustard[300]}
              icon={<BiSolidLandmark className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '2rem' }} />}
              // tooltipLabel={attraction.title}
              hovered={hovered}
              setHovered={() => {
                zoom(attraction.lat, attraction.lng);
                setHovered &&
                  setHovered({
                    ...attraction,
                    title: (
                      <div className="flex justify-start items-center">
                        {attraction.title}
                        {userLat && userLng && (
                          <>
                            <div className="h-[4px] w-[4px] mx-2 bg-black rounded-full" />
                            <div className="font-normal">{calculateDistance(userLat, userLng, attraction.lat, attraction.lng)} away</div>
                          </>
                        )}
                        {/* <ParkStatusTag>{attraction.status}</ParkStatusTag> */}
                      </div>
                    ),
                    image: attraction.images ? attraction.images[0] : null,
                    entityType: 'ATTRACTION',
                    children: (
                      <div className="h-full w-full flex flex-col justify-between">
                        <div>
                          <Typography.Paragraph ellipsis={{ rows: 2 }}>{attraction.description}</Typography.Paragraph>
                        </div>
                        <div className="-mt-2">
                          <span className="text-secondary">Open Today: </span>
                          <Tag bordered={false}>{dayjs(attraction.openingHours[currentDay]).format('hh:mm A')}</Tag> -{' '}
                          <Tag bordered={false}>{dayjs(attraction.closingHours[currentDay]).format('hh:mm A')}</Tag>
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
                  });
              }}
            />
          </>
        ))}

      {(showFacilities || showEvents) &&
        facilities &&
        facilities.map(
          (facility) =>
            facility.lat &&
            facility.long && (
              <>
                {zoomLevel && zoomLevel > 16 && (
                  <MarkerLabel
                    lat={facility.lat}
                    lng={facility.long}
                    entityId={facility.id}
                    fillColor={COLORS.sky[200]}
                    textColor={COLORS.sky[700]}
                    label={facility.name}
                    position="bottom"
                  />
                )}
                <FacilityEventsPictureMarker
                  facility={{ ...facility, events: [] }}
                  circleWidth={38}
                  events={facility.events}
                  lat={facility.lat}
                  lng={facility.long}
                  facilityType={facility.facilityType}
                  showFacilities={(showFacilities && showFacilityBasedOnType(facility)) || false}
                  showEvents={showEvents || false}
                  hovered={hovered}
                  setHovered={setHovered}
                  userLat={userLat}
                  userLng={userLng}
                />
              </>
            ),
        )}
    </>
  );
};

//
const Information = ({ hoverItem, setHovered }: InformationProps) => {
  const { title, image, entityType, children } = hoverItem;
  return (
    <div
      style={{
        position: 'absolute',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
      className="rounded-lg bg-white/90 px-4 py-3 border-lg box-shadow w-full bottom-0 shadow-lg md:m-2 md:left-0 md:w-[350px]"
    >
      <div className="absolute z-20 -mt-6 flex justify-between w-full pr-8">
        {entityType === 'EVENT' ? (
          <div className="h-10 rounded-full bg-sky-400 flex items-center px-4">
            <PiStarFill className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Event</div>
          </div>
        ) : entityType === 'FACILITY' ? (
          <div className="h-10 rounded-full bg-gray-500 flex items-center px-4">
            <div className="text-base text-white font-semibold">Facility</div>
          </div>
        ) : entityType === 'ATTRACTION' ? (
          <div className="h-10 rounded-full bg-mustard-400 flex items-center px-4">
            <BiSolidLandmark className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Attraction</div>
          </div>
        ) : entityType === 'OCCURRENCE' ? (
          <div className="h-10 rounded-full bg-green-400 flex items-center px-4">
            <PiPlantFill className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Occurrence</div>
          </div>
        ) : entityType === 'DECARB' ? (
          <div className="h-10 rounded-full bg-green-400 flex items-center px-4">
            <IoLeafSharp className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Decarbonization Area</div>
          </div>
        ) : entityType === 'ZONE' ? (
          <div className="h-10 rounded-full bg-green-400 flex items-center px-4">
            <div className="text-base text-white font-semibold ml-2">Zone</div>
          </div>
        ) : (
          <div className="h-10 rounded-full bg-sky-400 flex items-center px-4">
            <BiSolidCalendarEvent className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Markeer</div>
          </div>
        )}

        <Button shape="circle" icon={<IoMdClose />} onClick={() => setHovered(null)}></Button>
      </div>
      <div
        style={{
          width: '100%',
          backgroundImage: `url('${image ? image : ''}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="rounded-lg h-20 shadow-md flex items-center justify-center text-white shrink-0 bg-gray-400 mb-2 overflow-hidden"
      >
        {!image && <Empty description="No Image" />}
      </div>
      <div className="font-semibold text-base mb-1">{title}</div>
      {children}
    </div>
  );
};
export default Zones;
