import { useAuth } from '@lepark/common-ui';
import { getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictPark = (parkId?: string) => {
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();

  useEffect(() => {
    if (!parkId || parkId === undefined) {
      navigate('/');
      return;
    }

    const fetchPark = async (parkId: string) => {
      setLoading(true);
      try {
        const parkResponse = await getParkById(parseInt(parkId));

        if (parkResponse.status === 200) {
          const fetchedPark = parkResponse.data;
          
          // Check if user has permission to view this park
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedPark.id) {
            setPark(fetchedPark);
          } else {
            throw new Error('Unauthorized access');
          }
        } else {
          throw new Error('Unable to fetch Park');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPark(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPark(parkId);
  }, [parkId, navigate, user]);

  return { park, loading };
};