import { useAuth } from '@lepark/common-ui';
import { getOccurrenceById, getSpeciesById, OccurrenceResponse, SpeciesResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictOccurrence = (occurrenceId?: string) => {
  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!occurrenceId || occurrenceId === undefined) {
      navigate('/');
      return;
    }

    const fetchOccurrence = async (occurrenceId: string) => {
      setLoading(true);
      setOccurrence(null);
      setSpecies(null);
      try {
        const occurrenceResponse = await getOccurrenceById(occurrenceId);

        if (occurrenceResponse.status === 200) {
          const fetchedOccurrence = occurrenceResponse.data;

          // Check if user has permission to view this occurrence
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedOccurrence.parkId) {
            setOccurrence(fetchedOccurrence);
            const speciesResponse = await getSpeciesById(fetchedOccurrence.speciesId);
            setSpecies(speciesResponse.data);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Occurrence not found');
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

    fetchOccurrence(occurrenceId);
  }, [occurrenceId, navigate, user]);

  const updateOccurrence = async (occurrence: OccurrenceResponse) => {
    setOccurrence(occurrence);
  };

  return { occurrence, species, loading, updateOccurrence };
};
