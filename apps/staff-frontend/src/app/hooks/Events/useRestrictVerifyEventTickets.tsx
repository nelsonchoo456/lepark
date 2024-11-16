import { useAuth } from '@lepark/common-ui';
import {
  getEventTicketById,
  getEventById,
  EventTicketResponse,
  EventResponse,
  StaffResponse,
  StaffType,
  getFacilityById,
} from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictVerifyEventTickets = (ticketId?: string) => {
  const [ticket, setTicket] = useState<EventTicketResponse | null>(null);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId || ticketId === undefined) {
      navigate('/');
      setLoading(false);
      return;
    }

    const fetchTicketDetails = async (ticketId: string) => {
      setLoading(true);
      setTicket(null);
      setEvent(null);
      try {
        const ticketResponse = await getEventTicketById(ticketId);
        console.log('ticketResponse', ticketResponse);
        if (ticketResponse.status === 200) {
          const fetchedTicket = ticketResponse.data;
          const eventResponse = await getEventById(fetchedTicket.eventTicketListing?.eventId || '');
          console.log('eventResponse', eventResponse);
          const fetchedEvent = eventResponse.data;
          const facility = await getFacilityById(fetchedEvent.facilityId);

          // Check if user has permission to verify this ticket
          if (
            user?.role === StaffType.SUPERADMIN ||
            (user?.role === StaffType.MANAGER && user.parkId === facility.data.parkId) ||
            (user?.role === StaffType.PARK_RANGER && user.parkId === facility.data.parkId)
          ) {
            setTicket(fetchedTicket);
            setEvent(fetchedEvent);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Ticket not found');
        }
      } catch (error: any) {
        if (error.message === 'Access denied') {
          setError(error.message || 'An error occurred');
          if (!notificationShown.current) {
            notification.error({
              message: 'Access Denied',
              description: 'You do not have permission to verify this ticket.',
            });
            notificationShown.current = true;
          }
          navigate('/');
        } else {
          setError(error.message || 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails(ticketId);
  }, [ticketId, navigate, user]);

  return { ticket, event, loading, error };
};
