import { useState, useEffect, useCallback } from 'react';
import { AnnouncementResponse, getAllAnnouncements } from '@lepark/data-access';

export const useFetchAnnouncements = () => {
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

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const triggerFetch = () => {
    fetchAnnouncements();
  };

  return { announcements, loading, error, triggerFetch };
};