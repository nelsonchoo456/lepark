import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllHubs, getHubsByParkId, HubResponse, StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchHubs = () => {
  const [hubs, setHubs] = useState<HubResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllHubs();
    } else if (user?.parkId) {
      fetchHubsByParkId(user.parkId);
    }
  }, [user, trigger]);

  const fetchAllHubs = async () => {
    setLoading(true);
    try {
      const hubsRes = await getAllHubs();
      if (hubsRes.status === 200) {
        const hubsData = hubsRes.data;
        console.log(hubsData);
        setHubs(Array.isArray(hubsData) ? hubsData : []); // Ensure hubsData is an array
        setLoading(false);
      }
    } catch (error) {
      setHubs([]); // Ensure hubs is an array even on error
      setLoading(false);
    }
  };

  const fetchHubsByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const hubsRes = await getHubsByParkId(parkId);
      if (hubsRes.status === 200) {
        const hubsData = hubsRes.data;
        setHubs(Array.isArray(hubsData) ? hubsData : []); // Ensure hubsData is an array
        setLoading(false);
      }
    } catch (error) {
      setHubs([]); // Ensure hubs is an array even on error
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev); // Toggle the trigger value
  };

  return { hubs, setHubs, fetchAllHubs, loading, triggerFetch };
};
