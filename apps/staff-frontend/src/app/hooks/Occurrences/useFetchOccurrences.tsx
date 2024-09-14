import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllOccurrences, getOccurrenceById, getOccurrencesByParkId, getParkById, OccurrenceResponse, StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchOccurrences = () => {
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllOccurrences();
    } else if (user?.parkId) {
      fetchOccurrencesByParkId(user.parkId)
    }
  }, [user, trigger]);

  const fetchAllOccurrences = async () => {
    setLoading(true);
    try {
      const occurrencesRes = await getAllOccurrences();
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData)
        setLoading(false);
      } 
    } catch (error) {
      setOccurrences([]);
      setLoading(false);
    }
  }

  const fetchOccurrencesByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const occurrencesRes = await getOccurrencesByParkId(parkId);
      if (occurrencesRes.status === 200) {
        const occurrencesData = occurrencesRes.data;
        setOccurrences(occurrencesData)
        setLoading(false);
      } 
    } catch (error) {
      setOccurrences([]);
      setLoading(false);
    }
  }

  const triggerFetch = () => {
    setTrigger(prev => !prev); // Toggle the trigger value
  };

  return { occurrences, setOccurrences, fetchAllOccurrences, loading, triggerFetch };
};
