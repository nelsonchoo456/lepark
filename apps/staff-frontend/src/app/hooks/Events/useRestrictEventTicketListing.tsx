import { useAuth } from '@lepark/common-ui';
import { getEventTicketListingById, getEventById, EventTicketListingResponse, EventResponse, StaffResponse, StaffType, getFacilityById } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictEventTicketListing = (ticketListingId?: string) => {
  const [ticketListing, setTicketListing] = useState<EventTicketListingResponse | null>(null);
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!ticketListingId || ticketListingId === undefined) {
      navigate('/');
      return;
    }

    const fetchTicketListingDetails = async (ticketListingId: string) => {
        setLoading(true);
        setTicketListing(null);
        setEvent(null);
        try {
          const ticketListingResponse = await getEventTicketListingById(ticketListingId);
  
          if (ticketListingResponse.status === 200) {
            const fetchedTicketListing = ticketListingResponse.data;
            const eventResponse = await getEventById(fetchedTicketListing.eventId);
            const fetchedEvent = eventResponse.data;
            const facilityResponse = await getFacilityById(fetchedEvent.facilityId);
            const fetchedFacility = facilityResponse.data;
  
            // Check if user has permission to view this ticket listing
            if (
              user?.role === StaffType.SUPERADMIN ||
              (user?.role === StaffType.MANAGER && user.parkId === fetchedFacility.parkId) ||
              (user?.role === StaffType.PARK_RANGER && user.parkId === fetchedFacility.parkId)
            ) {
              setTicketListing(fetchedTicketListing);
              setEvent(fetchedEvent);
            } else {
              throw new Error('Access denied');
            }
          } else {
          throw new Error('Ticket listing not found');
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

    fetchTicketListingDetails(ticketListingId);
  }, [ticketListingId, navigate, user]);

  const refreshTicketListing = async (updatedTicketListing: EventTicketListingResponse) => {
    setTicketListing(updatedTicketListing);
  };

  return { ticketListing, event, loading, refreshTicketListing };
};