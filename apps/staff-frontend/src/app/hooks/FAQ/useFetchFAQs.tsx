import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import {
  getAllFAQs,
  getFAQsByParkId,
  FAQResponse,
  StaffResponse,
  StaffType
} from '@lepark/data-access';

export const useFetchFAQs = () => {
  const [faqs, setFAQs] = useState<FAQResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllFAQs();
    } else if (user?.parkId) {
      fetchFAQsByParkId(user.parkId);
    }
  }, [user, trigger]);

  const fetchAllFAQs = async () => {
    setLoading(true);
    try {
      const faqsRes = await getAllFAQs();
      if (faqsRes.status === 200) {
        const faqsData = faqsRes.data;
        setFAQs(Array.isArray(faqsData) ? faqsData : []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      message.error('Failed to fetch FAQs');
      setFAQs([]);
      setLoading(false);
    }
  };

  const fetchFAQsByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const faqsRes = await getFAQsByParkId(parkId);
      if (faqsRes.status === 200) {
        const faqsData = faqsRes.data;
        setFAQs(Array.isArray(faqsData) ? faqsData : []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching FAQs for park:', error);
      message.error('Failed to fetch FAQs for this park');
      setFAQs([]);
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger(prev => !prev);
  };

  return { faqs, setFAQs, fetchAllFAQs, loading, triggerFetch };
};
