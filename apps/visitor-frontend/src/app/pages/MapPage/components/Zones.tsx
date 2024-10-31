import { AttractionResponse, FacilityWithEvents, getZonesByParkId, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import PolygonWithLabel from '../../../components/map/PolygonWithLabel';
import { Button, Select } from 'antd';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { HiOutlineBuildingLibrary } from 'react-icons/hi2';
import { FaLandmark, FaStar, FaTicket } from 'react-icons/fa6';
import { useFetchMarkersGroup } from '../../../components/map/hooks/useFetchMarkersGroup';
import { HoverItem } from '../../../components/map/interfaces/interfaces';

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
  return zones?.map((z) => <OneZone zone={z} />);
};

// -- [ LAYER 2 ] --
// Zone
const OneZone = ({ zone }: OneZoneProps) => {
  return (
    <>
      <MarkersHandlers zone={zone} />
      <PolygonWithLabel entityId={zone.id} geom={zone.geom} color="transparent" fillOpacity={0.5} />
    </>
  );
};

// -- [ LAYER 3a ] --
// Handlers for Attractions, Events, Facilities
const MarkersHandlers = ({ zone }: OneZoneProps) => {
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
  } = useFetchMarkersGroup({ zone });

  useEffect(() => {
    if (attractions && facilities) {
      setShowAttractions(true);
    setShowEvents(true);
    setShowFacilities(true)
    }
    
  }, [attractions, facilities])
  

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
            key={"facilities-vis"}
            onClick={() => setShowFacilities(prev => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showFacilities ? 'bg-sky-400' : 'bg-sky-200'
            }`}
          >
            <FaLandmark />
            <div style={{ fontSize: '0.7rem' }}>Facilities</div>
          </div>
          <div
            key={"attractions-vis"}
            onClick={()=> setShowAttractions(prev => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showAttractions === true ? 'bg-mustard-400' : 'bg-mustard-200'
            }`}
          >
            <FaStar />
            <div style={{ fontSize: '0.7rem' }}>Attractions</div>
          </div>
          <div
            key={"events-vis"}
            onClick={() => setShowEvents(prev => !prev)}
            className={`flex flex-col items-center text-white w-16 py-2 rounded-md ${
              showEvents ? 'bg-highlightGreen-400' : 'bg-highlightGreen-200'
            }`}
          >
            <FaTicket />
            <div style={{ fontSize: '0.7rem' }}>Events</div>
          </div>
        </div>
      </div>
      <PolygonWithLabel entityId={zone.id} geom={zone.geom} color="transparent" fillOpacity={0.5} />
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
      />
    </>
  );
};

// -- [ LAYER 3b ] --
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
}: MarkersGroupProps) => {
  return <>
  </>;
};

export default Zones;
