import { useAuth } from '@lepark/common-ui';
import { getParkAssetById, ParkAssetResponse, StaffType, StaffResponse, getParkById, ParkResponse } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictAsset = (assetId?: string) => {
  const [asset, setAsset] = useState<ParkAssetResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
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
      setAsset(null);
      try {
        const assetResponse = await getParkAssetById(assetId);

        if (assetResponse.status === 200) {
          const fetchedAsset = assetResponse.data;
          console.log('fetched user is' + user);
          console.log('fetchedAsset park id is' + fetchedAsset.facility?.parkId);
          // Check if user has permission to view this asset
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedAsset.facility?.parkId) {
            setAsset(fetchedAsset);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Asset not found');
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You do not have permission to access this resource.',
          });
          notificationShown.current = true;
        }
        navigate(user?.role === StaffType.MANAGER || user?.role === StaffType.SUPERADMIN ? '/parkasset' : '/');
      } finally {
        setLoading(false);
      }
    };

    fetchAsset(assetId);
  }, [assetId, navigate, user]);

  useEffect(() => {
    //
    if (asset) {
      const fetchPark = async () => {
        try {
          if (asset.facility?.parkId) {
            const parkResponse = await getParkById(asset.facility.parkId);
            setPark(parkResponse.data);
          }
        } catch (error) {
          //do nothing
        }
      };

      fetchPark();
    }
  }, [asset]);

  return { asset, park, loading };
};
