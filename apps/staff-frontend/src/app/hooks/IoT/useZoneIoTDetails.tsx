import { useState, useEffect } from 'react';
import {
  SensorResponse,
  SensorTypeEnum,
  getSensorsByZoneId,
  getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo,
  getZoneTrendForSensorType,
  getUnhealthyOccurrences,
} from '@lepark/data-access';

export const useZoneIoTDetails = (zoneId: string) => {
  const [sensors, setSensors] = useState<SensorResponse[]>([]);
  const [averageReadings, setAverageReadings] = useState<{ [key: string]: number }>({});
  const [trends, setTrends] = useState<{ [key: string]: any }>({});
  const [unhealthyOccurrences, setUnhealthyOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredSensorTypes = [SensorTypeEnum.SOIL_MOISTURE, SensorTypeEnum.TEMPERATURE, SensorTypeEnum.LIGHT, SensorTypeEnum.HUMIDITY];

  useEffect(() => {
    const fetchZoneDetails = async () => {
      try {
        setLoading(true);

        const sensorsResponse = await getSensorsByZoneId(Number(zoneId));
        setSensors(sensorsResponse.data.filter((sensor) => sensor.sensorType !== SensorTypeEnum.CAMERA));

        const avgReadings = await getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo(Number(zoneId), 4);
        setAverageReadings(avgReadings.data);

        const trendPromises = filteredSensorTypes.map(async (sensorType) => {
          const trend = await getZoneTrendForSensorType(Number(zoneId), sensorType, 4);
          return { [sensorType]: trend.data };
        });
        const trendResults = await Promise.all(trendPromises);
        setTrends(Object.assign({}, ...trendResults));

        const unhealthyResponse = await getUnhealthyOccurrences(Number(zoneId));
        setUnhealthyOccurrences(unhealthyResponse.data);
      } catch (error) {
        console.error('Error fetching zone details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (zoneId) {
      fetchZoneDetails();
    }
  }, [zoneId]);

  return {
    sensors,
    averageReadings,
    trends,
    unhealthyOccurrences,
    loading,
    filteredSensorTypes,
  };
};
