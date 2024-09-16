import { useAuth } from '@lepark/common-ui';
import { getOccurrenceById, getSpeciesById, OccurrenceResponse, SpeciesResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { message, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictOccurrence = (occurrenceId?: string) => {
  const { user } = useAuth<StaffResponse>();
  const [occurrence, setOccurrence] = useState<OccurrenceResponse>();
  const [species, setSpecies] = useState<SpeciesResponse>();
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!occurrenceId || occurrenceId === undefined) {
      navigate('/');
      return;
    }
    fetchOccurrence(occurrenceId);
  }, []);

  const fetchOccurrence = async (occurrenceId: string) => {
    setLoading(true);
    try {
      const occurrenceResponse = await getOccurrenceById(occurrenceId);

      if (occurrenceResponse.status === 200) {
        const occurrence = occurrenceResponse.data;
        handleParkRestrictions(occurrence);
      } else {
        throw new Error('Unable to fetch Occurrence');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // && (user?.role === StaffType.MANAGER || user?.role === StaffType.ARBORIST || user?.role === StaffType.ARBORIST))
  const handleParkRestrictions = async (occurrence: OccurrenceResponse) => {
    if (user?.role === StaffType.SUPERADMIN || user?.parkId === occurrence.parkId) {
      setOccurrence(occurrence);
      const speciesResponse = await getSpeciesById(occurrence.speciesId);
      setSpecies(speciesResponse.data);
    } else {
      if (!notificationShown.current) {
        notification.error({
          message: 'Access Denied',
          description: 'You are not allowed to access the details of this occurrence!',
        });
        notificationShown.current = true;
      }
      navigate('/');
    }
  };

  return { occurrence, species, loading };
};
