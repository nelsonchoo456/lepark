import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllPromotions, getPlantTasksByParkId, getPromotionsByParkId, PlantTaskResponse, PromotionResponse, StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchPromotions = (archived?: boolean, enabled?: boolean) => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [nParksPromotions, setNParksPromotions] = useState<PromotionResponse[]>([]);
  const [parksPromotions, setParksPromotions] = useState<PromotionResponse[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.role === StaffType.SUPERADMIN) {
      fetchPromotions();
    } else if (user?.parkId) {
      fetchPromotionsByParkId(user.parkId.toString());
    }
  }, [user, trigger]);

  useEffect(() => {
    if (!user) return;
    if (user.role === StaffType.SUPERADMIN && promotions.length > 0) {
      setNParksPromotions(promotions.filter((p) => p.isNParksWide))
      setParksPromotions(promotions.filter((p) => p.isNParksWide === false))
    } 
  }, [promotions]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const promotionsRes = await getAllPromotions(archived, enabled);
      if (promotionsRes.status === 200) {
        const promotionsData = promotionsRes.data;
        setPromotions(promotionsData);
        setLoading(false);
      }
    } catch (error) {
      setPromotions([]);
      setLoading(false);
      message.error('Failed to fetch Promotions');
    }
  };

  const fetchPromotionsByParkId = async (parkId: string) => {
    setLoading(true);
    try {
      const promotionsRes = await getPromotionsByParkId(parkId, archived, enabled);
      if (promotionsRes.status === 200) {
        const promotionsData = promotionsRes.data;
        setPromotions(promotionsData);
        setLoading(false);
      }
    } catch (error) {
      setPromotions([]);
      setLoading(false);
      message.error('Failed to fetch Promotions');
    }
  };


  const triggerFetch = () => {
    setTrigger(prev => !prev);
  };

  return { promotions, parksPromotions, nParksPromotions, loading, triggerFetch };
};