import { useAuth } from '@lepark/common-ui';
import { getParkAssetById, ParkAssetResponse, StaffType, StaffResponse } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictAsset = (assetId?: string) => {
  const [asset, setAsset] = useState<ParkAssetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!assetId || assetId === undefined) {
      navigate('/');
      return;
    }

    const fetchAsset = async (assetId: string) => {
      setLoading(true);
      setNotFound(false);
      setAsset(null);
      try {
        const assetResponse = await getParkAssetById(assetId);

        if (assetResponse.status === 200) {
          const fetchedAsset = assetResponse.data;

          // Check if user has permission to view this asset
          if (user?.role === StaffType.SUPERADMIN ||
              (user?.role === StaffType.MANAGER && user?.parkId === fetchedAsset.parkId) ||
              (user?.role === StaffType.LANDSCAPE_ARCHITECT && user?.parkId === fetchedAsset.parkId) ||
              (user?.role === StaffType.PARK_RANGER && user?.parkId === fetchedAsset.parkId)) {
            setAsset(fetchedAsset);
          } else {
            if (!notificationShown.current) {
              notification.error({
                message: 'Access Denied',
                description: 'You are not allowed to access this asset details!',
              });
              notificationShown.current = true;
            }
            navigate(user?.role === StaffType.MANAGER || user?.role === StaffType.SUPERADMIN ? '/parkasset' : '/');
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset(assetId);
  }, [assetId, navigate, user]);

  return { asset, loading, notFound };
};
