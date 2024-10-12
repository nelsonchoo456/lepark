import { useState, useEffect, useCallback } from 'react';
import { AnnouncementResponse, getAllAnnouncements, getAnnouncementsByParkId, getNParksAnnouncements } from '@lepark/data-access';

export const useFetchAnnouncements = (parkId?: number) => {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllAnnouncements();
      setAnnouncements(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnnouncementsByParkId = useCallback(async (parkId: number) => {
    try {
      setLoading(true);
      const response = await getAnnouncementsByParkId(parkId);
      const response2 = await getNParksAnnouncements();
      setAnnouncements([...response.data, ...response2.data]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (parkId) {
      fetchAnnouncementsByParkId(parkId);
    } else {
      fetchAnnouncements();
    }
  }, [parkId, fetchAnnouncements, fetchAnnouncementsByParkId]);

  const triggerFetch = () => {
    if (parkId) {
      fetchAnnouncementsByParkId(parkId);
    } else {
      fetchAnnouncements();
    }
  };

  return { announcements, loading, error, triggerFetch };
};
