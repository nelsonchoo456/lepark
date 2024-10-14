import { useAuth } from '@lepark/common-ui';
import { FacilityResponse, getFacilityById, getParkById, ParkResponse } from '@lepark/data-access';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { usePark } from '../../park-context/ParkContext';

export const useRestrictFacilities = (facilityId?: string) => {
  const [facility, setFacility] = useState<FacilityResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { selectedPark } = usePark();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!facilityId || facilityId === undefined) {
      navigate('/');
      return;
    }
    fetchFacility(facilityId);
  }, [facilityId, navigate, selectedPark]);

  const fetchFacility = async (facilityId: string) => {
    setLoading(true);
    setFacility(null);
    setPark(null);
    try {
      const facilityResponse = await getFacilityById(facilityId);

      if (facilityResponse.status === 200) {
        const fetchedFacility = facilityResponse.data;

        // Check if the facility is public and belongs to the selected park
        if (!fetchedFacility.isPublic || fetchedFacility.parkId !== selectedPark?.id) {
          throw new Error('Access denied');
        }

        setFacility(fetchedFacility);
        const parkResponse = await getParkById(fetchedFacility.parkId);
        setPark(parkResponse.data);
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

  const refresh = useCallback(() => {
    if (facilityId) {
      fetchFacility(facilityId);
    }
  }, [facilityId]);

  return { facility, park, loading, refresh };
};
