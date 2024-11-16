import { useAuth } from '@lepark/common-ui';
import { getBookingById, BookingResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictBooking = (bookingId?: string) => {
  const [booking, setBooking] = useState<BookingResponse>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!bookingId || bookingId === undefined) {
      navigate('/');
      return;
    }

    const fetchBooking = async (bookingId: string) => {
      setLoading(true);
      try {
        const bookingResponse = await getBookingById(bookingId);

        if (bookingResponse.status === 200) {
          const fetchedBooking = bookingResponse.data;
          console.log('Fetched Booking:', fetchedBooking);

          // Check if user has permission to view this booking
          if (user?.role === StaffType.SUPERADMIN || (fetchedBooking.facility && user?.parkId === fetchedBooking.facility.parkId)) {
            setBooking(fetchedBooking);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
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

    fetchBooking(bookingId);
  }, [bookingId, navigate, user]);

  return { booking, loading };
};