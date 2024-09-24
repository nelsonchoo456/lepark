import { useState, useEffect } from 'react';
import { FacilityResponse, getFacilitiesByParkId } from '@lepark/data-access';

export const useFetchOpenFacilitiesByPark = (parkId: number | null) => {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setFacilities(response.data);
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