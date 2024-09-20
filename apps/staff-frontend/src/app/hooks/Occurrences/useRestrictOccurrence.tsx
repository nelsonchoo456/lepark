import { useAuth } from '@lepark/common-ui';
import { getOccurrenceById, getSpeciesById, OccurrenceResponse, SpeciesResponse, StaffResponse } from '@lepark/data-access';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictOccurrence = (occurrenceId?: string) => {
  const [occurrence, setOccurrence] = useState<OccurrenceResponse>();
  const [species, setSpecies] = useState<SpeciesResponse>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!occurrenceId || occurrenceId === undefined) {
      navigate('/');
      return;
    }
    fetchOccurrence(occurrenceId);
  }, [occurrenceId, navigate]);

  const fetchOccurrence = async (occurrenceId: string) => {
    setLoading(true);
    try {
      const occurrenceResponse = await getOccurrenceById(occurrenceId);

      if (occurrenceResponse.status === 200) {
        const occurrence = occurrenceResponse.data;
        setOccurrence(occurrence);
        const speciesResponse = await getSpeciesById(occurrence.speciesId);
        setSpecies(speciesResponse.data);
      } else {
        throw new Error('Unable to fetch Occurrence');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { occurrence, species, loading };
};
