import { useAuth } from '@lepark/common-ui';
import { getPlantTaskById, PlantTaskResponse, StaffResponse, StaffRoleEnum } from '@lepark/data-access';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

export const useRestrictPlantTask = (plantTaskId?: string) => {
  const [plantTask, setPlantTask] = useState<PlantTaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth<StaffResponse>();
  const notificationShown = useRef(false);

  useEffect(() => {
    if (!plantTaskId || plantTaskId === undefined) {
      navigate('/');
      return;
    }

    const fetchPlantTask = async (plantTaskId: string) => {
      setLoading(true);
      setPlantTask(null);
      try {
        const plantTaskResponse = await getPlantTaskById(plantTaskId);

        if (plantTaskResponse.status === 200) {
          const fetchedPlantTask = plantTaskResponse.data;

          // Check if user has permission to view this plant task
          if (
            (user?.role === StaffRoleEnum.BOTANIST || user?.role === StaffRoleEnum.ARBORIST) &&
            user?.parkId === fetchedPlantTask.occurrence.zone.parkId
          ) {
            setPlantTask(fetchedPlantTask);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Plant task not found');
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

    fetchPlantTask(plantTaskId);
  }, [plantTaskId, navigate, user]);

  const updatePlantTask = async (plantTask: PlantTaskResponse) => {
    setPlantTask(plantTask);
  };

  return { plantTask, loading, updatePlantTask };
};