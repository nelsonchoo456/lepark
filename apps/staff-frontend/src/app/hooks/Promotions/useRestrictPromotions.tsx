import { useAuth } from '@lepark/common-ui';
import { getPromotionById, PromotionResponse, StaffResponse, StaffType } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictPromotions = (promotionId?: string) => {
  const [promotion, setPromotion] = useState<PromotionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!promotionId || promotionId === undefined) {
      navigate('/');
      return;
    }

    const fetchPromotion = async (promotionId: string) => {
      setLoading(true);
      setPromotion(null);
      try {
        const promotionResponse = await getPromotionById(promotionId);

        if (promotionResponse.status === 200) {
          const fetchedPromotion = promotionResponse.data;

          // Check if user has permission to view this plant task
          if (user?.role === StaffType.SUPERADMIN || (user?.role === StaffType.MANAGER && fetchedPromotion.parkId && fetchedPromotion.parkId === user?.parkId)) {
            setPromotion(fetchedPromotion);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Promotion not found');
        }
      } catch (error) {
        console.log(error)
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

    fetchPromotion(promotionId);
  }, [promotionId, navigate, user]);

  const updatePromotion = async (promotion: PromotionResponse) => {
    setPromotion(promotion);
  };

  return { promotion, loading, updatePromotion };
};