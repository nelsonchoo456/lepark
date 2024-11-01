import { useAuth } from '@lepark/common-ui';
import {
  getFeedbackById,
  getParkById,
  FeedbackResponse,
  ParkResponse,
  StaffResponse,
} from '@lepark/data-access';
import { StaffType } from '@lepark/data-access';
import { notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictFeedbacks = (feedbackId?: string) => {
  const { user } = useAuth<StaffResponse>();
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [park, setPark] = useState<ParkResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFeedback = async (feedbackId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const feedbackResponse = await getFeedbackById(feedbackId);

      if (feedbackResponse.status === 200) {
        const fetchedFeedback = feedbackResponse.data;

        if (fetchedFeedback.parkId) {
          const parkResponse = await getParkById(fetchedFeedback.parkId);
          const park = parkResponse.data;
          setPark(park);

           if (user?.role === StaffType.SUPERADMIN ||
              (user?.parkId === park?.id && (user?.role === StaffType.MANAGER || user?.role === StaffType.PARK_RANGER))) {
            setFeedback(fetchedFeedback);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Park not found for this feedback');
        }
      } else {
        throw new Error('Unable to fetch Feedback');
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

  useEffect(() => {
    if (!feedbackId || feedbackId === undefined) {
      navigate('/');
      return;
    }
    fetchFeedback(feedbackId);
  }, [feedbackId, navigate, refreshKey]);

  const refreshFeedback = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { feedback, loading, park, refreshFeedback };
};
