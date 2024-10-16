import { useAuth } from '@lepark/common-ui';
import { getFAQById, FAQResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictFAQsEdit = (faqId?: string) => {
  const [faq, setFAQ] = useState<FAQResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!faqId || faqId === undefined) {
      navigate('/');
      return;
    }

    const fetchFAQ = async (faqId: string) => {
      setLoading(true);
      setFAQ(null);
      try {
        const faqResponse = await getFAQById(faqId);

        if (faqResponse.status === 200) {
          const fetchedFAQ = faqResponse.data;

          // Check if user has permission to view this FAQ
          if (user?.role === StaffType.SUPERADMIN ||
              ((user?.role === StaffType.PARK_RANGER || user?.role === StaffType.MANAGER) &&
               user?.parkId === fetchedFAQ.parkId)) {
            setFAQ(fetchedFAQ);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('FAQ not found');
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

    fetchFAQ(faqId);
  }, [faqId, navigate, user]);

  return { faq, loading };
};
