import { useAuth } from '@lepark/common-ui';
import { getAttractionTicketListingById, getAttractionById, AttractionTicketListingResponse, AttractionResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictAttractionTicketListing = (ticketListingId?: string) => {
  const [ticketListing, setTicketListing] = useState<AttractionTicketListingResponse | null>(null);
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
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
        setAttraction(null);
        try {
          const ticketListingResponse = await getAttractionTicketListingById(ticketListingId);
  
          if (ticketListingResponse.status === 200) {
            const fetchedTicketListing = ticketListingResponse.data;
            const attractionResponse = await getAttractionById(fetchedTicketListing.attractionId);
            const fetchedAttraction = attractionResponse.data;
  
            // Check if user has permission to view this ticket listing
            if (
              user?.role === StaffType.SUPERADMIN ||
              (user?.role === StaffType.MANAGER && user.parkId === fetchedAttraction.parkId) ||
              (user?.role === StaffType.PARK_RANGER && user.parkId === fetchedAttraction.parkId)
            ) {
              setTicketListing(fetchedTicketListing);
              setAttraction(fetchedAttraction);
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

  const refreshTicketListing = async (updatedTicketListing: AttractionTicketListingResponse) => {
    setTicketListing(updatedTicketListing);
  };

  return { ticketListing, attraction, loading, refreshTicketListing };
};