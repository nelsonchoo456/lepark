import { useState, useEffect } from 'react';
import { message } from 'antd'; // or whatever message system you are using
import { useAuth } from '@lepark/common-ui';
import { getAllZones, getZonesByParkId, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom'; // or your routing solution

export const useFetchZones = () => {
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllZones();
    } else if (user?.parkId) {
      fetchZonesByParkId(user?.parkId);
    }
  }, [user]);

  const fetchAllZones = async () => {
    try {
      setLoading(true);
      const response = await getAllZones();
      setZones(response.data);
    } catch (error) {
      message.error('Failed to fetch Zones');
    } finally {
      setLoading(false);
    }
  };

  const fetchZonesByParkId = async (parkId: number) => {
    try {
      setLoading(true);
      const response = await getZonesByParkId(parkId);
      setZones(response.data);
    } catch (error) {
      message.error('Failed to fetch Zones');
    } finally {
      setLoading(false);
    }
  };

  return { zones, loading, setZones, fetchAllZones, fetchZonesByParkId };
};
