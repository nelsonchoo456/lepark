import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import {
  getAllFAQs,
  getFAQsByParkId,
  FAQResponse,
  VisitorResponse,
} from '@lepark/data-access';

export const useFetchFAQs = (selectedParkId?: number) => {
  const [faqs, setFAQs] = useState<FAQResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!selectedParkId) return;

    const fetchAndFilterFAQs = async () => {
      await fetchAllFAQs();
      setFAQs(prevFAQs => prevFAQs.filter(faq => faq.parkId === selectedParkId || faq.parkId === null));
    };

    fetchAndFilterFAQs();
  }, [selectedParkId, trigger]);

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

  const triggerFetch = () => {
    setTrigger(prev => !prev);
  };

  return { faqs, setFAQs, fetchAllFAQs, loading, triggerFetch };
};
