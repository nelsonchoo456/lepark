import { useState, useEffect } from 'react';
import { getEventsByFacilityId, EventResponse } from '@lepark/data-access';
import moment from 'moment';

interface UseFetchEventsByFacilityIdResult {
  events: EventResponse[];
  bookedDates: moment.Moment[];
  isLoading: boolean;
  error: Error | null;
}

export const useFetchEventsByFacilityId = (facilityId: string | null, currentEventId?: string): UseFetchEventsByFacilityIdResult => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [bookedDates, setBookedDates] = useState<moment.Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!facilityId) {
        setEvents([]);
        setBookedDates([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getEventsByFacilityId(facilityId);
        const fetchedEvents = response.data;
        setEvents(fetchedEvents);

        const today = moment().tz('Asia/Singapore').startOf('day');
        const dates = fetchedEvents
          .filter(e => e.id !== currentEventId)
          .flatMap(e => {
            const start = moment.max(moment(e.startDate).tz('Asia/Singapore').startOf('day'), today);
            const end = moment(e.endDate).tz('Asia/Singapore').endOf('day');
            const dates = [];
            for (let m = moment(start); m.isSameOrBefore(end, 'day'); m.add(1, 'days')) {
              dates.push(m.clone());
            }
            return dates;
          });
        setBookedDates(dates);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching events'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [facilityId, currentEventId]);

  return { events, bookedDates, isLoading, error };
};