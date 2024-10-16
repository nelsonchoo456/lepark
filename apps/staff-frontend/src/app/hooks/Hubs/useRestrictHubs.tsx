import { useAuth } from '@lepark/common-ui';
import {
  getHubById,
  getFacilityById,
  getParkById,
  HubResponse,
  FacilityResponse,
  ParkResponse,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';
import { notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictHub = (hubId?: string) => {
  const [hub, setHub] = useState<HubResponse | null>(null);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!hubId || hubId === undefined) {
      navigate('/');
      return;
    }

    const fetchHub = async (hubId: string) => {
      setLoading(true);
      setHub(null);
      setFacility(null);
      try {
        const hubResponse = await getHubById(hubId);

        if (hubResponse.status === 200) {
          const fetchedHub = hubResponse.data;

          // Fetch facility information
          if (fetchedHub.facilityId) {
            const facilityResponse = await getFacilityById(fetchedHub.facilityId);
            const fetchedFacility = facilityResponse.data;
            setFacility(fetchedFacility);

            // Check if user has permission to view this hub
            if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedFacility.parkId) {
              setHub(fetchedHub);
            } else {
              throw new Error('Access denied');
            }
          } else {
            throw new Error('Facility not found for this hub');
          }
        } else {
          throw new Error('Hub not found');
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

    fetchHub(hubId);
  }, [hubId, navigate, user, trigger]);

  const triggerFetch = () => {
    setTrigger((prev) => !prev);
  };

  return { hub, facility, loading, triggerFetch };
};
