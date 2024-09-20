import { useState, useEffect } from 'react';
import { ZoneResponse, getAllZones, getZonesByParkId } from '@lepark/data-access';

export const useFetchZones = (parkId?: number | null) => {
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        let response;
        if (parkId === undefined) {
          // Fetch all zones when no parkId is provided (for ZoneList)
          response = await getAllZones();
        } else if (parkId !== null) {
          // Fetch zones for a specific park (for OccurrenceCreate)
          response = await getZonesByParkId(parkId);
        } else {
          // When parkId is null (for OccurrenceCreate before a park is selected)
          setZones([]);
          setLoading(false);
          return;
        }
        setZones(response.data);
      } catch (error) {
        console.error('Error fetching zones:', error);
        setZones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [parkId]);

  return { zones, loading };
};
