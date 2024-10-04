import { useAuth } from '@lepark/common-ui';
import { AnnouncementResponse, viewAnnouncementDetails, getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictAnnouncements = (announcementId?: string) => {
  const [announcement, setAnnouncement] = useState<AnnouncementResponse | null>(null);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!announcementId || announcementId === undefined) {
      navigate('/');
      return;
    }
    fetchAnnouncement(announcementId);
  }, [announcementId, navigate, user]);

  const fetchAnnouncement = async (announcementId: string) => {
    setLoading(true);
    setAnnouncement(null);

    setPark(null);
    try {
      const announcementResponse = await viewAnnouncementDetails(announcementId);

      if (announcementResponse.status === 200) {
        const fetchedAnnouncement = announcementResponse.data;

        // Check if user has permission to view this announcement

        if (!fetchedAnnouncement.parkId) {
          setAnnouncement(fetchedAnnouncement);
        } else {
          if (user?.role === StaffType.SUPERADMIN || user?.parkId === fetchedAnnouncement.parkId) {
            setAnnouncement(fetchedAnnouncement);
            const parkResponse = await getParkById(fetchedAnnouncement.parkId);

            setPark(parkResponse.data);
          } else {
            throw new Error('Access denied');
          }
        }
      } else {
        throw new Error('Attraction not found');
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

  const refresh = useCallback(() => {
    if (announcementId) {
      fetchAnnouncement(announcementId);
    }
  }, [announcementId, fetchAnnouncement]);

  return { announcement, park, loading, refresh };
};
