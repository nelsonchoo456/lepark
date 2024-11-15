import { useState, useEffect } from 'react';
import { getHubsByZoneId, getPredictionsForZone, HubResponse, HubStatusEnum, PredictiveIrrigation } from '@lepark/data-access';

export const useZonePredictiveIrrigation = (zoneId: string) => {
  const [hubs, setHubs] = useState<HubResponse[]>([]);
  const [predictives, setPredictives] = useState<
    (PredictiveIrrigation & {
      hubId: string;
      hubName: string;
    })[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zoneId) {
      fetchData(parseInt(zoneId));
    }
  }, [zoneId]);

  const fetchData = async (zoneId: number) => {
    setLoading(true);
    try {
      // Fetch both hubs and predictions in parallel
      const [hubsResponse, predictionsResponse] = await Promise.all([getHubsByZoneId(zoneId), getPredictionsForZone(zoneId)]);

      setHubs(hubsResponse.data.filter((h) => h.hubStatus === HubStatusEnum.ACTIVE));
      setPredictives(predictionsResponse.data);
    } catch (error) {
      console.error('Error fetching predictive irrigation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorUnit = (type: string) => {
    switch (type) {
      case 'TEMPERATURE':
        return '°C';
      case 'HUMIDITY':
        return '%';
      case 'LIGHT':
        return 'Lux';
      case 'SOIL_MOISTURE':
        return '%';
      default:
        return '';
    }
  };

  return {
    hubs,
    predictives,
    loading,
    getSensorUnit,
    refreshData: () => fetchData(parseInt(zoneId)),
  };
};
