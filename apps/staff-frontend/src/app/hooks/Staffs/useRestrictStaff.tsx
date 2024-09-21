import { useAuth } from '@lepark/common-ui';
import { viewStaffDetails, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictStaff = (staffId?: string) => {
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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
      setNotFound(false);
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
                description: 'You are not allowed to access this staff details!',
              });
              notificationShown.current = true;
            }
            navigate(user?.role === StaffType.MANAGER || user?.role === StaffType.SUPERADMIN ? '/staff-management' : '/');
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

    fetchStaff(staffId);
  }, [staffId, navigate, user]);

  return { staff, loading, notFound };
};
