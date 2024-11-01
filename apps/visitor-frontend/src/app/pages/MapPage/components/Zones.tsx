import { AttractionResponse, FacilityWithEvents, getZonesByParkId, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { Button, Select, Tooltip, Typography } from 'antd';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { HiOutlineBuildingLibrary } from 'react-icons/hi2';
import { FaLandmark, FaStar, FaTicket } from 'react-icons/fa6';
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

interface OneZoneProps {
  zone: ZoneResponse;
}

interface ZonesProps {
  park: ParkResponse;
}

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
}

// -- [ LAYER 1 ] --
// Zones all
const Zones = ({ park }: ZonesProps) => {
  const [zones, setZones] = useState<ZoneResponse[]>();

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
  return (
    <>
      {zones?.map((z) => (
        <OneZone zone={z} />
      ))}{' '}
      <MarkersHandlers park={park} />
    </>
  );
};

// -- [ LAYER 2b ] --
// Zone
const OneZone = ({ zone }: OneZoneProps) => {
  return <PolygonWithLabel entityId={zone.id} geom={zone.geom} color="transparent" fillOpacity={0.5} polygonLabel={zone.name} labelFields={{ fontSize: "14px" }}/>;
};

// -- [ LAYER 2a ] --
// Handlers for Attractions, Events, Facilities
const MarkersHandlers = ({ park }: ZonesProps) => {
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
  const map = useMap(); // Access the map instance
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  useEffect(() => {
    if (attractions && facilities) {
      setShowAttractions(true);
      setShowEvents(true);
      setShowFacilities(true);
    }
  }, [attractions, facilities]);

  useEffect(() => {
    const handleZoom = () => {
      setZoomLevel(map.getZoom());
    };

    map.on('zoom', handleZoom); // Listen to zoom changes
    return () => {
      map.off('zoom', handleZoom); // Cleanup listener
    };
  }, [map]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '100%',
          padding: '0 1rem 0 3.6rem',
          maxWidth: '600px',
        }}
      >
        <Select showSearch defaultActiveFirstOption={false} suffixIcon={<FiSearch />} filterOption={false} className="w-full" />
        <div className="flex flex-col items-end justify-end mt-2 gap-2">
          <div
            key={'facilities-vis'}
            onClick={() => setShowFacilities((prev) => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${showFacilities ? 'bg-sky-400' : 'bg-sky-200'}`}
          >
            <FaLandmark />
            <div style={{ fontSize: '0.7rem' }}>Facilities</div>
          </div>
          <div
            key={'attractions-vis'}
            onClick={() => setShowAttractions((prev) => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showAttractions === true ? 'bg-mustard-400' : 'bg-mustard-200'
            }`}
          >
            <FaStar />
            <div style={{ fontSize: '0.7rem' }}>Attractions</div>
          </div>
          <div
            key={'events-vis'}
            onClick={() => setShowEvents((prev) => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showEvents ? 'bg-highlightGreen-400' : 'bg-highlightGreen-200'
            }`}
          >
            <FaTicket />
            <div style={{ fontSize: '0.7rem' }}>Events</div>
          </div>
        </div>
      </div>
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
}: MarkersGroupProps) => {
  const navigate = useNavigate();

  return (
    <>
      {showAttractions &&
        attractions &&
        attractions.map((attraction) => (
          <>
            {zoomLevel && zoomLevel > 16 && <MarkerLabel lat={attraction.lat} lng={attraction.lng} entityId={attraction.id} fillColor={COLORS.mustard[200]} textColor={COLORS.mustard[700]} label={attraction.title} />}
            <PictureMarker
              key={attraction.id}
              id={attraction.id}
              entityType="ATTRACTION"
              circleWidth={30}
              lat={attraction.lat}
              lng={attraction.lng}
              backgroundColor={COLORS.mustard[300]}
              icon={<TbTicket className="text-mustard-600 drop-shadow-lg" style={{ fontSize: '3rem' }} />}
              // tooltipLabel={attraction.title}
              hovered={hovered}
              setHovered={() =>
                setHovered &&
                setHovered({
                  ...attraction,
                  title: (
                    <div className="flex justify-between items-center">
                      {attraction.title}
                      {/* <ParkStatusTag>{attraction.status}</ParkStatusTag> */}
                    </div>
                  ),
                  image: attraction.images ? attraction.images[0] : null,
                  entityType: 'ATTRACTION',
                  children: (
                    <div className="h-full w-full flex flex-col justify-between">
                      <div>
                        <Typography.Paragraph ellipsis={{ rows: 3 }}>{attraction.description}</Typography.Paragraph>
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
          </>
        ))}

      {(showFacilities || showEvents) &&
        facilities &&
        facilities.map(
          (facility) =>
            facility.lat &&
            facility.long && (<>
              {zoomLevel && zoomLevel > 16 && <MarkerLabel lat={facility.lat} lng={facility.long} entityId={facility.id} fillColor={COLORS.sky[200]} textColor={COLORS.sky[700]} label={facility.name} position='bottom'/>}
              <FacilityEventsPictureMarker
                facility={{ ...facility, events: [] }}
                circleWidth={38}
                events={facility.events}
                lat={facility.lat}
                lng={facility.long}
                facilityType={facility.facilityType}
                showFacilities={showFacilities || false}
                showEvents={showEvents || false}
                hovered={hovered}
                setHovered={setHovered}
              />
            </>),
        )}
    </>
  );
};

export default Zones;
