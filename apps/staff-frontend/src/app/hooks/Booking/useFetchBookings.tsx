import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllBookings, BookingResponse, StaffResponse, StaffType, getBookingsByVisitorId, getBookingsByParkId } from '@lepark/data-access';

export const useFetchBookings = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllBookings();
    } else if (user?.id && user.parkId !== undefined) {
      fetchBookingsByParkId(user.parkId);
    }
  }, [user, trigger]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const bookingsRes = await getAllBookings();
      if (bookingsRes.status === 200) {
        const bookingsData = bookingsRes.data;
        setBookings(Array.isArray(bookingsData) ? bookingsData : []); // Ensure bookingsData is an array
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to fetch bookings');
      setBookings([]); // Ensure bookings is an array even on error
      setLoading(false);
    }
  };

  const fetchBookingsByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const bookingsRes = await getBookingsByParkId(parkId);
      if (bookingsRes.status === 200) {
        const bookingsData = bookingsRes.data;
        setBookings(Array.isArray(bookingsData) ? bookingsData : []); // Ensure bookingsData is an array
        setLoading(false);
      }
    } catch (error) {
      setBookings([]); // Ensure bookings is an array even on error
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev); // Toggle the trigger value
  };

  return { bookings, setBookings, fetchAllBookings, loading, triggerFetch };
};