import { useAuth } from '@lepark/common-ui';
import { getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';


// Added disableNavigation option to prevent navigation to home if the park is not found
interface UseRestrictParkOptions {
  disableNavigation?: boolean;
}

export const useRestrictPark = (parkId?: string, options: UseRestrictParkOptions = {}) => {
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!parkId || parkId === undefined) {
      if (!options.disableNavigation) {
        navigate('/');
      }
      return;
    }

    const fetchPark = async (parkId: string) => {
      setLoading(true);
      setPark(null);
      try {
        const parkResponse = await getParkById(parseInt(parkId));

        if (parkResponse.status === 200) {
          const fetchedPark = parkResponse.data;

          // Check if user has permission to view this park
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedPark.id) {
            setPark(fetchedPark);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Park not found');
        }
      } catch (error) {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You do not have permission to access this resource.',
          });
          notificationShown.current = true;
        }
        if (!options.disableNavigation) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPark(parkId);
  }, [parkId, navigate, user, options.disableNavigation]);

  return { park, loading };
};
