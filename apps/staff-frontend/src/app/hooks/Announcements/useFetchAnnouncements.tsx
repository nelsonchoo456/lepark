import { useState, useEffect, useCallback } from 'react';
import { AnnouncementResponse, getAllAnnouncements, getAnnouncementsByParkId, getNParksAnnouncements, StaffResponse, StaffType } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';

export const useFetchAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth<StaffResponse>();
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
      const response = await getAnnouncementsByParkId(parkId);
      const response2 = await getNParksAnnouncements();
      setAnnouncements([...response.data, ...response2.data]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAnnouncements();
    } else if (user?.parkId) {
      fetchAnnouncementsByParkId(user.parkId);
    }
  }, [user, fetchAnnouncements, fetchAnnouncementsByParkId]);

  const triggerFetch = () => {
    fetchAnnouncements();
  };

  return { announcements, loading, error, triggerFetch };
};