import { useEffect, useState } from 'react';
import { getDecarbonizationAreasByParkId, DecarbonizationAreaResponse, getAllDecarbonizationAreas } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchDecarbonizationAreas = () => {
  const [decarbonizationAreas, setDecarbonizationAreas] = useState<DecarbonizationAreaResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth<StaffResponse>();

  const fetchDecarbonizationAreas = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllDecarbonizationAreas();
      } else if (user?.parkId) {
        response = await getDecarbonizationAreasByParkId(user.parkId);
      } else {
        // Handle case where user is not a superadmin and doesn't have a parkId
        setDecarbonizationAreas([]);
        setLoading(false);
        return;
      }
      setDecarbonizationAreas(response.data);
    } catch (error) {
      console.error('Error fetching decarbonization areas:', error);
      setDecarbonizationAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecarbonizationAreas();
  }, [user]);

  const triggerFetch = () => {
    fetchDecarbonizationAreas();
  };

  return { decarbonizationAreas, loading, triggerFetch };
};
