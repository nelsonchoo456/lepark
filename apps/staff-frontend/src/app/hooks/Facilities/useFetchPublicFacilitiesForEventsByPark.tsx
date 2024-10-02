import { useState, useEffect } from 'react';
import { FacilityResponse, getFacilitiesByParkId } from '@lepark/data-access';

export const useFetchPublicFacilitiesForEventsByPark = (parkId: number | null) => {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_FACILITY_TYPES = [
    'PLAYGROUND',
    'CARPARK',
    'STAGE',
    'PICNIC_AREA',
    'BBQ_PIT',
    'CAMPING_AREA',
    'AMPHITHEATER',
    'GAZEBO',
  ] as const;
  
  type AllowedFacilityType = typeof ALLOWED_FACILITY_TYPES[number];

  useEffect(() => {
    const fetchFacilities = async () => {
      if (!parkId) {
        setFacilities([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getFacilitiesByParkId(parkId);
        const filteredFacilities = response.data.filter(
          facility => 
            facility.isPublic && 
            facility.facilityType &&
            ALLOWED_FACILITY_TYPES.includes(facility.facilityType as AllowedFacilityType)
        );
        setFacilities(filteredFacilities);
      } catch (err) {
        console.error('Failed to fetch facilities:', err);
        setError('Failed to fetch facilities. Please try again.');
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, [parkId]);

  return { facilities, isLoading, error };
};