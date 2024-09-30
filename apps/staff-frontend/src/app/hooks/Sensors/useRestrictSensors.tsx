import { useAuth } from '@lepark/common-ui';
import {
  getFacilityById,
  getSensorById,
  getParkById,
  SensorResponse,
  ParkResponse,
  StaffResponse,
  FacilityResponse,
} from '@lepark/data-access';
import { StaffType } from '@lepark/data-access';
import { message, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictSensors = (sensorId?: string) => {
  const { user } = useAuth<StaffResponse>();
  const [sensor, setSensor] = useState<SensorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [facility, setFacility] = useState<FacilityResponse | null>(null);

  useEffect(() => {
    if (!sensorId || sensorId === undefined) {
      navigate('/');
      return;
    }
    fetchSensor(sensorId);
  }, [sensorId, navigate]);

  const fetchSensor = async (sensorId: string) => {
    setLoading(true);
    setSensor(null);
    try {
      const sensorResponse = await getSensorById(sensorId);

      if (sensorResponse.status === 200) {
        const fetchedSensor = sensorResponse.data;

        if (fetchedSensor.facilityId) {
          const facilityResponse = await getFacilityById(fetchedSensor.facilityId);
          const facility = facilityResponse.data;
          setFacility(facility);

          if (user?.parkId === facility?.parkId || user?.role === StaffType.SUPERADMIN) {
            setSensor(fetchedSensor);
          } else {
            throw new Error('Access denied');
          }
        } else {
          throw new Error('Facility not found for this sensor');
        }
      } else {
        throw new Error('Unable to fetch Sensor');
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

  return { sensor, loading, facility };
};
