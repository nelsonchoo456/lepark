import { useAuth } from '@lepark/common-ui';
import { getFacilityById, getHubById, getParkById, HubResponse, ParkResponse, StaffResponse } from '@lepark/data-access';
import { StaffType } from '@lepark/data-access';
import { message, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { set } from 'zod';

export const useRestrictHub = (hubId?: string) => {
  const { user } = useAuth<StaffResponse>();
  const [hub, setHub] = useState<HubResponse>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [park, setPark] = useState<ParkResponse>();

  useEffect(() => {
    if (!hubId || hubId === undefined) {
      navigate('/');
      return;
    }
    fetchHub(hubId);
  }, [hubId, navigate]);

  const fetchHub = async (hubId: string) => {
    setLoading(true);
    try {
      const hubResponse = await getHubById(hubId);

      if (hubResponse.status === 200) {
        const hub = hubResponse.data;
        handleHubRestrictions(hub);
      } else {
        throw new Error('Unable to fetch Hub');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHubRestrictions = async (hub: HubResponse) => {
    if (hub.facilityId) {
      const facilityResponse = await getFacilityById(hub.facilityId);
      const facility = facilityResponse.data;
      const parkResponse = await getParkById(facility.parkId);
      setPark(parkResponse.data);
    }

    if ([StaffType.SUPERADMIN, StaffType.MANAGER, StaffType.LANDSCAPE_ARCHITECT, StaffType.PARK_RANGER].includes(user?.role as StaffType) || user?.parkId === park?.id) {
        setHub(hub);
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
  };

  return { hub, loading };
};
