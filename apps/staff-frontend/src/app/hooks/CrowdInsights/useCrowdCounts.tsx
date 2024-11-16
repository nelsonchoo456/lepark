import { getAllParks, getAggregatedCrowdDataForPark, getParkById } from '@lepark/data-access';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useParkThresholds } from '../../pages/CrowdInsight/CalculateCrowdThresholds';

export interface ParkVisitorCount {
  parkId: number;
  parkName: string;
  liveCount: number;
  weeklyCount: number;
  threshold: number;
  isOverThreshold: boolean;
}

export interface VisitorCounts {
  total: {
    live: number;
    weekly: number;
  };
  parks: ParkVisitorCount[];
  loading: boolean;
  error: string | null;
}

export const useCrowdCounts = (parkId?: number, refreshInterval = 5 * 60 * 1000): VisitorCounts => {
  const [visitorCounts, setVisitorCounts] = useState<VisitorCounts>({
    total: { live: 0, weekly: 0 },
    parks: [],
    loading: true,
    error: null,
  });

  const fetchVisitorCounts = async () => {
    try {
      const parksResponse = await getAllParks();
      const allParks = parksResponse.data;
      const today = moment().tz('Asia/Singapore').startOf('day');
      const weekAgo = moment().tz('Asia/Singapore').subtract(6, 'days').startOf('day');

      // Filter parks based on parkId if provided
      const parksToProcess = parkId ? allParks.filter((p) => p.id === parkId) : allParks;

      const parkCounts = await Promise.all(
        parksToProcess.map(async (park) => {
          const thresholds = useParkThresholds(park.id, park.geom, allParks);

          const [todayData, weeklyData] = await Promise.all([
            getAggregatedCrowdDataForPark(park.id, today.toDate(), moment().tz('Asia/Singapore').endOf('day').toDate()),
            getAggregatedCrowdDataForPark(park.id, weekAgo.toDate(), moment().tz('Asia/Singapore').endOf('day').toDate()),
          ]);

          const liveCount = todayData.data[todayData.data.length - 1]?.crowdLevel || 0;
          const weeklyCount = weeklyData.data.reduce((sum: any, reading: { crowdLevel: any }) => sum + (reading.crowdLevel || 0), 0);

          return {
            parkId: park.id,
            parkName: park.name,
            liveCount: Math.round(liveCount),
            weeklyCount: Math.round(weeklyCount),
            threshold: (await thresholds).moderate,
            isOverThreshold: liveCount > (await thresholds).moderate,
          };
        }),
      );

      const totalLive = parkCounts.reduce((sum, park) => sum + park.liveCount, 0);
      const totalWeekly = parkCounts.reduce((sum, park) => sum + park.weeklyCount, 0);

      setVisitorCounts({
        total: {
          live: totalLive,
          weekly: totalWeekly,
        },
        parks: parkCounts,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching visitor counts:', error);
      setVisitorCounts((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch visitor counts',
      }));
    }
  };

  useEffect(() => {
    fetchVisitorCounts();
    const interval = setInterval(fetchVisitorCounts, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, parkId]);

  return visitorCounts;
};
