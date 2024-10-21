import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import {
  getAllFeedback,
  getFeedbackByParkId,
  FeedbackResponse,
  StaffResponse,
  StaffType
} from '@lepark/data-access';

export const useFetchFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchFeedbacks();
  }, [user, trigger]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let feedbacksData;
      if (user?.role === StaffType.SUPERADMIN) {
        const response = await getAllFeedback();
        feedbacksData = response.data;
      } else if (user?.parkId) {
        const response = await getFeedbackByParkId(user.parkId);
        feedbacksData = response.data;
      }

      if (Array.isArray(feedbacksData)) {
        setFeedbacks(feedbacksData);
      } else {
        console.error('Unexpected feedback data format:', feedbacksData);
        setFeedbacks([]);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      message.error('Failed to fetch feedbacks');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev);
  };

  return { feedbacks, setFeedbacks, fetchFeedbacks, loading, triggerFetch };
};
