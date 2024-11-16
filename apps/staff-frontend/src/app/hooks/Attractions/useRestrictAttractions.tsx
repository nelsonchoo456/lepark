import { useAuth } from '@lepark/common-ui';
import { AttractionResponse, getAttractionById, getOccurrenceById, getParkById, getSpeciesById, OccurrenceResponse, ParkResponse, SpeciesResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictAttractions = (attractionId?: string) => {
  const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!attractionId || attractionId === undefined) {
      navigate('/');
      return;

    }

    fetchAttraction(attractionId);
  }, [attractionId, navigate, user, trigger]);

  const fetchAttraction = async (attractionId: string) => {
    setLoading(true);
    setAttraction(null);

    setPark(null);
    try {
      const attractionResponse = await getAttractionById(attractionId);

      if (attractionResponse.status === 200) {

        const fetchedAttraction = attractionResponse.data;

        // Check if user has permission to view this attraction

        if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedAttraction.parkId) {
          setAttraction(fetchedAttraction);
          const parkResponse = await getParkById(fetchedAttraction.parkId);

          setPark(parkResponse.data);
        } else {
          throw new Error('Access denied');

        }
      } else {
        throw new Error('Attraction not found');
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

  const triggerFetch = async () => {
    setTrigger((prev) => !prev);
  };

  return { attraction, park, loading, triggerFetch };
};
