import { useAuth } from '@lepark/common-ui';
import {
  getAttractionTicketById,
  getAttractionById,
  AttractionTicketResponse,
  AttractionResponse,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictVerifyAttractionTicket = (ticketId?: string) => {
  const [ticket, setTicket] = useState<AttractionTicketResponse | null>(null);
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
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
      setAttraction(null);
      try {
        const ticketResponse = await getAttractionTicketById(ticketId);
        console.log('ticketResponse', ticketResponse);
        if (ticketResponse.status === 200) {
          const fetchedTicket = ticketResponse.data;
          const attractionResponse = await getAttractionById(fetchedTicket.attractionTicketListing?.attractionId || '');
          console.log('attractionResponse', attractionResponse);
          const fetchedAttraction = attractionResponse.data;

          // Check if user has permission to verify this ticket
          if (
            user?.role === StaffType.SUPERADMIN ||
            (user?.role === StaffType.MANAGER && user.parkId === fetchedAttraction.parkId) ||
            (user?.role === StaffType.PARK_RANGER && user.parkId === fetchedAttraction.parkId)
          ) {
            setTicket(fetchedTicket);
            setAttraction(fetchedAttraction);
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

  return { ticket, attraction, loading, error };
};
