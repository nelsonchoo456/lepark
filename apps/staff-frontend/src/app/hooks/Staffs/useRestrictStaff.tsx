import { useAuth } from '@lepark/common-ui';
import { viewStaffDetails, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictStaff = (staffId?: string, refreshKey?: number) => {
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!staffId || staffId === undefined) {
      navigate('/');
      return;
    }

    const fetchStaff = async (staffId: string) => {
      setLoading(true);
      setStaff(null);
      try {
        const staffResponse = await viewStaffDetails(staffId);

        if (staffResponse.status === 200) {
          const fetchedStaff = staffResponse.data;

          // Check if user has permission to view this staff
          if (user?.role === StaffType.SUPERADMIN || (user?.role === StaffType.MANAGER && user?.parkId === fetchedStaff.parkId)) {
            setStaff(fetchedStaff);
          } else {
            if (!notificationShown.current) {
              notification.error({
                message: 'Access Denied',
                description: 'You do not have permission to access this resource.',
              });
              notificationShown.current = true;
            }
            navigate('/');
          }
        } else {
          if (!notificationShown.current) {
            notification.error({
              message: 'Access Denied',
              description: 'You do not have permission to access this resource.',
            });
            notificationShown.current = true;
          }
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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

    fetchStaff(staffId);
  }, [staffId, navigate, user, refreshKey]); // Add refreshKey to the dependency array

  return { staff, loading };
};
