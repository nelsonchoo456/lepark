import { useAuth } from '@lepark/common-ui';
import { getZoneById, ZoneResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictZone = (zoneId?: string) => {
  const [zone, setZone] = useState<ZoneResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!zoneId || zoneId === undefined) {
      navigate('/');
      return;
    }

    const fetchZone = async (zoneId: string) => {
      setLoading(true);
      setZone(null);
      try {
        const zoneResponse = await getZoneById(Number(zoneId));

        if (zoneResponse.status === 200) {
          const fetchedZone = zoneResponse.data;

          // Check if user has permission to view this zone
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedZone.parkId) {
            setZone(fetchedZone);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Zone not found');
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

    fetchZone(zoneId);
  }, [zoneId, navigate, user, trigger]);

  const triggerFetch = () => {
    setTrigger((prev) => !prev);
  };

  return { zone, loading, triggerFetch };
};
