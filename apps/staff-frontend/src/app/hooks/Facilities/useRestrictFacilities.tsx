import { useAuth } from '@lepark/common-ui';
import { FacilityResponse, getFacilityById, getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictFacilities = (facilityId?: string) => {
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!facilityId || facilityId === undefined) {
      navigate('/');
      return;
    }

    fetchFacility(facilityId);
  }, [facilityId, navigate, user, trigger]);

  const fetchFacility = async (facilityId: string) => {
    setLoading(true);
    setFacility(null);
    setPark(null);

    try {
      const facilityResponse = await getFacilityById(facilityId);

      if (facilityResponse.status === 200) {
        const fetchedFacility = facilityResponse.data;

        // Check if user has permission to view this facility
        if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedFacility.parkId) {
          setFacility(fetchedFacility);
          const parkResponse = await getParkById(fetchedFacility.parkId);
          setPark(parkResponse.data);
        } else {
          throw new Error('Access denied');
        }
      } else {
        throw new Error('Facility not found');
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

  const triggerFetch = async () => {
    setTrigger((prev) => !prev);
  };

  return { facility, park, loading, triggerFetch };
};
