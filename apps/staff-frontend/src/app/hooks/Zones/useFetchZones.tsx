import { useState, useEffect } from 'react';
import { ZoneResponse, getAllZones, getZonesByParkId } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';
import { StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchZones = () => {
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<StaffResponse>();

  const fetchZones = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllZones();
      } else if (user?.parkId) {
        response = await getZonesByParkId(user.parkId);
      } else {
        // Handle case where user is not a superadmin and doesn't have a parkId
        setZones([]);
        setLoading(false);
        return;
      }
      setZones(response.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [user]);

  const triggerFetch = () => {
    fetchZones();
  };

  return { zones, loading, triggerFetch };
};
