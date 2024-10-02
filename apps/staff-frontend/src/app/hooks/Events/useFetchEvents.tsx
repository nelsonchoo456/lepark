import { useState, useEffect } from 'react';
import { EventResponse, getAllEvents, getEventsByParkId, StaffResponse, StaffType } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';

export const useFetchEvents = () => {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const { user } = useAuth<StaffResponse>();
    const [loading, setLoading] = useState(false);
    const [trigger, setTrigger] = useState(false);
  
    useEffect(() => {
      if (!user) return;
      if (user?.role === StaffType.SUPERADMIN) {
        fetchAllEvents();
      } else if (user?.parkId) {
        fetchEventsByParkId(user.parkId);
      }
    }, [user, trigger]);
  
    const fetchAllEvents = async () => {
      setLoading(true);
      try {
        const eventsRes = await getAllEvents();
        if (eventsRes.status === 200) {
          setEvents(eventsRes.data);
        }
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchEventsByParkId = async (parkId: number) => {
      setLoading(true);
      try {
        const eventsRes = await getEventsByParkId(parkId);
        if (eventsRes.status === 200) {
          setEvents(eventsRes.data);
        }
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
  
    const triggerFetch = () => {
      setTrigger(prev => !prev);
    };
  
    return { events, setEvents, fetchAllEvents, loading, triggerFetch };
};