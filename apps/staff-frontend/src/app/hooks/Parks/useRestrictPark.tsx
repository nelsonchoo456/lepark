import { useAuth } from '@lepark/common-ui';
import { getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictPark = (parkId?: string) => {
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!parkId || parkId === undefined) {
      navigate('/');
      return;
    }

    const fetchPark = async (parkId: string) => {
      setLoading(true);
      setNotFound(false); // Reset notFound state
      setPark(null); // Reset park state
      try {
        const parkResponse = await getParkById(parseInt(parkId));

        if (parkResponse.status === 200) {
          const fetchedPark = parkResponse.data;

          // Check if user has permission to view this park
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedPark.id) {
            setPark(fetchedPark);
          } else {
            if (!notificationShown.current) {
              notification.error({
                message: 'Access Denied',
                description: 'You are not allowed to access this park!',
              });
              notificationShown.current = true;
            }
            navigate('/');
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

    fetchPark(parkId);
  }, [parkId, navigate, user]);

  return { park, loading, notFound };
};
