import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllParkAssets, ParkAssetResponse, StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchAssets = () => {
  const [assets, setAssets] = useState<ParkAssetResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchParkAssets();
  }, [user, trigger]);

  const fetchParkAssets = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role === StaffType.SUPERADMIN) {
        response = await getAllParkAssets();
      } else if (user?.parkId) {
        response = await getAllParkAssets(user.parkId);
      } else {
        throw new Error('Unauthorized access or missing park ID');
      }

      if (response.status === 200) {
        const assetsData = response.data;
        setAssets(Array.isArray(assetsData) ? assetsData : []);
      }
    } catch (error) {
      console.error('Error fetching park asset data:', error);
      message.error('Failed to fetch park assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev);
  };

  return { assets, setAssets, fetchParkAssets, loading, triggerFetch };
};
