import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllFacilities, FacilityResponse, StaffResponse, StaffType, getFacilityById, getFacilitiesByParkId } from '@lepark/data-access';

export const useFetchFacilities = () => {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllFacilities();
    } else if (user?.parkId) {
      fetchFacilitiesByParkId(user.parkId);
    }
  }, [user, trigger]);

  const fetchAllFacilities = async () => {
    setLoading(true);
    try {
      const facilitiesRes = await getAllFacilities();
      if (facilitiesRes.status === 200) {
        const facilitiesData = facilitiesRes.data;
        setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []); // Ensure facilitiesData is an array
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      message.error('Failed to fetch facilities');
      setFacilities([]); // Ensure facilities is an array even on error
      setLoading(false);
    }
  };

  const fetchFacilitiesByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const facilitiesRes = await getFacilitiesByParkId(parkId);
      if (facilitiesRes.status === 200) {
        const facilitiesData = facilitiesRes.data;
        setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []); // Ensure hubsData is an array
        setLoading(false);
      }
    } catch (error) {
      setFacilities([]); // Ensure hubs is an array even on error
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev); // Toggle the trigger value
  };

  return { facilities, setFacilities, fetchAllFacilities, loading, triggerFetch };
};
