import { useState, useEffect } from 'react';
import { useAuth } from '@lepark/common-ui';
import {
  getOccurrencesWithinDecarbonizationArea,
  OccurrenceResponse,
  VisitorResponse,
} from '@lepark/data-access';

export const useFetchOccurrencesForDecarbArea = (decarbAreaId: string) => {
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);
  const { user } = useAuth<VisitorResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    fetchOccurrences();
  }, [decarbAreaId, trigger]);

  const fetchOccurrences = async () => {
    if (!decarbAreaId) return;
    setLoading(true);
    try {
      const occurrencesRes = await getOccurrencesWithinDecarbonizationArea(decarbAreaId);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData);
        console.log(occurrencesData);
      }
    } catch (error) {
      console.error('Error fetching occurrences for decarb area:', error);
      setOccurrences([]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev);
  };

  return { occurrences, setOccurrences, loading, triggerFetch };
};
