import { useAuth } from '@lepark/common-ui';
import { AttractionResponse, EventResponse, FacilityResponse, getAttractionById, getEventById, getFacilityById, getOccurrenceById, getParkById, getSpeciesById, OccurrenceResponse, ParkResponse, SpeciesResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictEvents = (eventId?: string) => {
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!eventId || eventId === undefined) {
      navigate('/');
      return;
    }

    const fetchEvent = async (eventId: string) => {
      setLoading(true);
      setEvent(null);
      setFacility(null);
      setPark(null);
      try {
        const eventResponse = await getEventById(eventId);

        if (eventResponse.status === 200) {

          const fetchedEvent = eventResponse.data;
          const facilityResponse = await getFacilityById(fetchedEvent.facilityId);
          const fetchedFacility = facilityResponse.data;

          // Check if user has permission to view this event
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedFacility.parkId) {
            setEvent(fetchedEvent);
            setFacility(fetchedFacility);
            const parkResponse = await getParkById(fetchedFacility.parkId);
            setPark(parkResponse.data);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Event not found');
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You do not have permission to access this resource.',
          });
          notificationShown.current = true;
        }
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent(eventId);
  }, [eventId, navigate, user]);



  return { event, facility, park, loading };
};
