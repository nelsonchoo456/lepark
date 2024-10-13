import { useAuth } from '@lepark/common-ui';
import { getDecarbonizationAreaById, DecarbonizationAreaResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictDecarbonizationArea = (areaId?: string) => {
  const [decarbonizationArea, setDecarbonizationArea] = useState<DecarbonizationAreaResponse>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!areaId || areaId === undefined) {
      navigate('/');
      return;
    }

    const fetchDecarbonizationArea = async (areaId: string) => {
      setLoading(true);
      try {
        const areaResponse = await getDecarbonizationAreaById(areaId);

        if (areaResponse.status === 200) {
          const fetchedArea = areaResponse.data;
          console.log('Fetched Area:', fetchedArea);

          // Check if user has permission to view this decarbonization area
          if (user?.role === StaffType.SUPERADMIN) {
            //} || user?.parkId === fetchedArea.parkId) {
            setDecarbonizationArea(fetchedArea);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Decarbonization area not found');
        }
      } catch (error) {
        console.error('Error fetching decarbonization area:', error);
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

    fetchDecarbonizationArea(areaId);
  }, [areaId, navigate, user]);

  return { decarbonizationArea, loading };
};
