import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import {
  getAllSensors,
  getSensorsByParkId,
  SensorResponse,
  StaffResponse,
  StaffType
} from '@lepark/data-access';

export const useFetchSensors = () => {
  const [sensors, setSensors] = useState<SensorResponse[]>([]);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchSensors();
  }, [user, trigger]);

  const fetchSensors = async () => {
    setLoading(true);
    try {
      let sensorsData;
      if (user?.role === StaffType.SUPERADMIN) {
        const response = await getAllSensors();
        sensorsData = response.data;
      } else if (user?.parkId) {
        const response = await getSensorsByParkId(user.parkId);
        sensorsData = response.data;
      }

      if (Array.isArray(sensorsData)) {
        setSensors(sensorsData);
      } else {
        console.error('Unexpected sensor data format:', sensorsData);
        setSensors([]);
      }
    } catch (error) {
      console.error('Error fetching sensors:', error);
      message.error('Failed to fetch sensors');
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFetch = () => {
    setTrigger((prev) => !prev);
  };

  return { sensors, setSensors, fetchSensors, loading, triggerFetch };
};
