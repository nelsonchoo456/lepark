import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { EventResponse, FacilityResponse, ParkResponse, getEventById, getFacilityById, getParkById } from '@lepark/data-access';
import { usePark } from '../../park-context/ParkContext';

export const useRestrictEvents = (eventId?: string) => {
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { selectedPark } = usePark();
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

          // Check if the event belongs to the selected park
          if (fetchedFacility.parkId !== selectedPark?.id) {
            throw new Error('Access denied');
          }

          setEvent(fetchedEvent);
          setFacility(fetchedFacility);
          const parkResponse = await getParkById(fetchedFacility.parkId);
          setPark(parkResponse.data);
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
  }, [eventId, navigate, selectedPark]);

  return { event, facility, park, loading };
};