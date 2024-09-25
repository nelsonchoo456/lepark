import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getPlantTasksByParkId, PlantTaskResponse, StaffResponse, StaffRoleEnum } from '@lepark/data-access';

export const useFetchPlantTasks = () => {
  const [plantTasks, setPlantTasks] = useState<PlantTaskResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === StaffRoleEnum.BOTANIST || user.role === StaffRoleEnum.ARBORIST) {
      fetchPlantTasksByParkId(user.parkId);
    }
  }, [user, trigger]);

  const fetchPlantTasksByParkId = async (parkId: number) => {
    setLoading(true);
    try {
      const plantTasksRes = await getPlantTasksByParkId(parkId);
      if (plantTasksRes.status === 200) {
        const plantTasksData = plantTasksRes.data;
        setPlantTasks(plantTasksData);
        setLoading(false);
      }
    } catch (error) {
      setPlantTasks([]);
      setLoading(false);
      message.error('Failed to fetch plant tasks');
    }
  };

  const triggerFetch = () => {
    setTrigger(prev => !prev);
  };

  return { plantTasks, setPlantTasks, fetchPlantTasksByParkId, loading, triggerFetch };
};