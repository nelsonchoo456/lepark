import { useState, useEffect } from 'react';
import { getBookingsByFacilityId, BookingResponse, BookingStatusEnum } from '@lepark/data-access';
import moment from 'moment';

interface UseFetchBookingsByFacilityIdResult {
  bookings: BookingResponse[];
  bookedDates: moment.Moment[];
  isLoading: boolean;
  error: Error | null;
}

const ACTIVE_BOOKING_STATUSES = [BookingStatusEnum.PENDING, BookingStatusEnum.APPROVED_PENDING_PAYMENT, BookingStatusEnum.CONFIRMED];

export const useFetchBookingsByFacilityId = (facilityId: string | null): UseFetchBookingsByFacilityIdResult => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookedDates, setBookedDates] = useState<moment.Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!facilityId) {
        setBookings([]);
        setBookedDates([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getBookingsByFacilityId(facilityId);
        const fetchedBookings = response.data.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.bookingStatus));
        setBookings(fetchedBookings);

        const today = moment().tz('Asia/Singapore').startOf('day');
        const dates = fetchedBookings.flatMap((booking) => {
          const start = moment.max(moment(booking.dateStart).tz('Asia/Singapore').startOf('day'), today);
          const end = moment(booking.dateEnd).tz('Asia/Singapore').endOf('day');
          const dates = [];
          for (let m = moment(start); m.isSameOrBefore(end, 'day'); m.add(1, 'days')) {
            dates.push(m.clone());
          }
          return dates;
        });
        setBookedDates(dates);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching bookings'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [facilityId]);

  return { bookings, bookedDates, isLoading, error };
};
