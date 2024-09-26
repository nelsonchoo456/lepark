import { useAuth } from '@lepark/common-ui';
import { getFacilityById, getSensorById, getParkById, SensorResponse, ParkResponse, StaffResponse } from '@lepark/data-access';
import { StaffType } from '@lepark/data-access';
import { message, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRestrictSensors = (sensorId?: string) => {
  const { user } = useAuth<StaffResponse>();
  const [sensor, setSensor] = useState<SensorResponse>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const notificationShown = useRef(false);
  const [park, setPark] = useState<ParkResponse>();

  useEffect(() => {
    if (!sensorId || sensorId === undefined) {
      navigate('/');
      return;
    }
    fetchSensor(sensorId);
  }, [sensorId, navigate]);

  const fetchSensor = async (sensorId: string) => {
    setLoading(true);
    try {
      const sensorResponse = await getSensorById(sensorId);

      if (sensorResponse.status === 200) {
        const sensor = sensorResponse.data;
        console.log('sensor:', sensor.facility);
        handleSensorRestrictions(sensor);
      } else {
        throw new Error('Unable to fetch Sensor');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSensorRestrictions = async (sensor: SensorResponse) => {
    if (sensor.facilityId) {
      const facilityResponse = await getFacilityById(sensor.facilityId);
      const facility = facilityResponse.data;
      const parkResponse = await getParkById(facility.parkId);
      const parkData = parkResponse.data;
      //setPark(parkData);

      if (user?.parkId === parkData?.id || user?.role === StaffType.SUPERADMIN) {
        setSensor(sensor);
      } else {
        if (!notificationShown.current) {
          notification.error({
            message: 'Access Denied',
            description: 'You do not have permission to access this resource.',
          });
          notificationShown.current = true;
        }
        navigate('/');
      }
    }
  };

  return { sensor, loading };
};
