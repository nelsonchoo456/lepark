import { useEffect, useState } from 'react';
import {
  getAttractionsByParkId,
  getEventsByFacilityId,
  getFacilitiesByParkId,
  getOccurrencesByZoneId,
  getParkById,
  AttractionResponse,
  OccurrenceResponse,
  FacilityWithEvents,
} from '@lepark/data-access';
import { pointInsidePolygonGeom } from '../../../components/map/functions/functions';
import { HoverItem } from '../interfaces/interfaces';

interface UseMapDataProps {
  zone: any; // Replace 'any' with the appropriate type for your zone object
}

export const useFetchMarkersGroup = ({ zone }: UseMapDataProps) => {
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>();
  const [attractions, setAttractions] = useState<AttractionResponse[]>();
  const [facilities, setFacilities] = useState<FacilityWithEvents[]>();
  const [facilityEvents, setFacilityEvents] = useState<FacilityWithEvents[]>();

  const [showOccurrences, setShowOccurrences] = useState<boolean>(false);
  const [showAttractions, setShowAttractions] = useState(false);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const [hovered, setHovered] = useState<HoverItem | null>(null)

  useEffect(() => {
    if (zone.id) {
      fetchAttractions();
      fetchFacilities();
      fetchEvents();
    }
  }, [zone]);

  const fetchOccurrences = async () => {
    const occurrenceRes = await getOccurrencesByZoneId(zone.id);
    console.log(occurrenceRes.data);
    if (occurrenceRes.status === 200) {
      setOccurrences(occurrenceRes.data);
    }
  };

  const fetchAttractions = async () => {
    const attractionsRes = await getAttractionsByParkId(zone.parkId);
    if (attractionsRes.status === 200) {
      const filteredAttractions = attractionsRes.data.filter((attraction) => pointInsidePolygonGeom(attraction, zone.geom.coordinates[0]));
      setAttractions(filteredAttractions);
    }
  };

  const fetchFacilities = async () => {
    const facilitiesRes = await getFacilitiesByParkId(zone.parkId);
    if (facilitiesRes.status === 200) {
      const filteredFacilities = facilitiesRes.data.filter(
        (facility) =>
          facility.lat && facility.long && pointInsidePolygonGeom({ lat: facility.lat, lng: facility.long }, zone.geom.coordinates[0]),
      );
      const facilitiesWithEvents = await Promise.all(
        filteredFacilities.map(async (facility) => {
          const facilityWithEvents: FacilityWithEvents = { ...facility, events: [] };
          try {
            const eventsRes = await getEventsByFacilityId(facility.id);
            if (eventsRes.status === 200) {
              facilityWithEvents.events = eventsRes.data;
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

  const fetchEvents = async () => {
    const eventsRes = await getEventsByFacilityId(zone.parkId);
    if (eventsRes.status === 200) {
      const eventsData = eventsRes.data;
      const facilityMap: Record<string, FacilityWithEvents> = {};

      eventsData.forEach((event) => {
        const { facility, ...restEvent } = event;
        const facilityId = event.facilityId as string;
        if (facilityId) {
          if (!facilityMap[facilityId]) {
            facilityMap[facilityId] = {
              ...facility,
              events: [restEvent],
            } as FacilityWithEvents;
          } else {
            facilityMap[facilityId].events.push(restEvent);
          }
        }
      });

      setFacilityEvents(Object.values(facilityMap));
    }
  };

  return {
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
  };
};
