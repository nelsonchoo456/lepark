import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import {
  getAllOccurrences,
  getOccurrenceById,
  getOccurrencesByParkId,
  getOccurrencesBySpeciesId,
  getOccurrencesBySpeciesIdByParkId,
  getParkById,
  OccurrenceResponse,
  StaffResponse,
  StaffType,
} from '@lepark/data-access';

export const useFetchOccurrencesForSpecies = (speciesId: string) => {
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (user?.parkId) {
      fetchOccurrencesByParkId(user.parkId);
    } else {
      fetchAllOccurrences();
    }
  }, [user, trigger]);

  const fetchAllOccurrences = async () => {
    setLoading(true);
    try {
      const occurrencesRes = await getOccurrencesBySpeciesId(speciesId);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData);
        setLoading(false);
      }
    } catch (error) {
      setOccurrences([]);
      setLoading(false);
    }
  };

  const fetchOccurrencesByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const occurrencesRes = await getOccurrencesBySpeciesIdByParkId(speciesId, parkId);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData);
        setLoading(false);
      }
    } catch (error) {
      setOccurrences([]);
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev); // Toggle the trigger value
  };

  return { occurrences, setOccurrences, fetchAllOccurrences, loading, triggerFetch };
};
