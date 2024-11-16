import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { uniqBy, sumBy } from 'lodash';
import {
  getAllSensorReadingsByParkIdAndSensorType,
  getAggregatedCrowdDataForPark,
  predictCrowdLevels,
  getPredictedCrowdLevelsForPark,
  SensorTypeEnum,
  ParkResponse,
} from '@lepark/data-access';

interface CrowdData {
  date: string;
  crowdLevel: number | null;
  predictedCrowdLevel: number | null;
}

interface UseFetchCrowdDataProps {
  parkId: number;
  parks: ParkResponse[];
}

export const useFetchCrowdData = ({ parkId, parks }: UseFetchCrowdDataProps) => {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (parks.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      // Pre-calculate timezone offset once
      const sgOffset = moment.tz.zone('Asia/Singapore')?.utcOffset(Date.now()) ?? 0;

      // Fetch sensor readings
      let allData;
      if (parkId === 0) {
        const allParksData = await Promise.all(
          parks.map((park) => getAllSensorReadingsByParkIdAndSensorType(park.id, SensorTypeEnum.CAMERA)),
        );
        allData = { data: allParksData.flatMap((response) => response.data) };
      } else {
        allData = await getAllSensorReadingsByParkIdAndSensorType(parkId, SensorTypeEnum.CAMERA);
      }

      if (!allData.data || allData.data.length === 0) {
        setCrowdData([]);
        return;
      }

      // Optimized date comparison
      const compareDates = (a: any, b: any) => {
        const dateA = new Date(a.date).getTime() + sgOffset * 60 * 1000;
        const dateB = new Date(b.date).getTime() + sgOffset * 60 * 1000;
        return dateA - dateB;
      };

      // Filter and sort in one pass
      const sortedData = allData.data
        .reduce((acc: any[], item: any) => {
          if (item?.date) acc.push(item);
          return acc;
        }, [])
        .sort(compareDates);

      if (sortedData.length === 0) {
        setCrowdData([]);
        return;
      }

      const startDate = moment.tz(sortedData[0].date, 'Asia/Singapore').startOf('day');
      const endDate = moment.tz(sortedData[sortedData.length - 1].date, 'Asia/Singapore').endOf('day');
      const today = moment().tz('Asia/Singapore').endOf('day');
      const predictionEndDate = today.clone().add(1, 'month').endOf('day');
      const historicalEndDate = today.isBefore(endDate) ? today : endDate;
      const distinctDays = uniqBy(sortedData, (item) => moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD')).length;
      const pastDaysToPredict = Math.max(distinctDays - 71, 0);

      // Fetch park data with parallel promises
      const fetchParkData = async (park: ParkResponse) => {
        const [historicalResponse, predictedResponse, pastPredictedResponse] = await Promise.all([
          getAggregatedCrowdDataForPark(park.id, startDate.toDate(), historicalEndDate.toDate()),
          predictCrowdLevels(park.id, 30),
          getPredictedCrowdLevelsForPark(park.id, pastDaysToPredict),
        ]);

        return {
          parkId: park.id,
          historical: historicalResponse.data,
          predicted: predictedResponse.data,
          pastPredicted: pastPredictedResponse.data,
        };
      };

      const parksToProcess = parkId === 0 ? parks : parks.filter((park) => park.id === parkId);
      const parksData = await Promise.all(parksToProcess.map(fetchParkData));

      // Data normalization
      const normalizeDate = (date: string) => moment.tz(date, 'Asia/Singapore').format('YYYY-MM-DD');

      // Combine data differently based on parkId
      let normalizedData;
      if (parkId === 0) {
        // Sum up data from all parks
        normalizedData = {
          historical: parksData[0].historical.map((item: any, index: number) => ({
            date: normalizeDate(item.date),
            crowdLevel: sumBy(parksData, (parkData) => parkData.historical[index].crowdLevel),
          })),
          predicted: parksData[0].predicted.map((item: any, index: number) => ({
            date: normalizeDate(item.date),
            predictedCrowdLevel: sumBy(parksData, (parkData) => parkData.predicted[index].predictedCrowdLevel),
          })),
          pastPredicted: parksData[0].pastPredicted.map((item: any, index: number) => ({
            date: normalizeDate(item.date),
            predictedCrowdLevel: sumBy(parksData, (parkData) => parkData.pastPredicted[index].predictedCrowdLevel),
          })),
        };
      } else {
        // Single park data
        normalizedData = {
          historical: parksData[0].historical.map((item: any) => ({
            date: normalizeDate(item.date),
            crowdLevel: item.crowdLevel,
          })),
          predicted: parksData[0].predicted.map((item: any) => ({
            date: normalizeDate(item.date),
            predictedCrowdLevel: item.predictedCrowdLevel,
          })),
          pastPredicted: parksData[0].pastPredicted.map((item: any) => ({
            date: normalizeDate(item.date),
            predictedCrowdLevel: item.predictedCrowdLevel,
          })),
        };
      }

      const allDates = new Set([
        ...normalizedData.historical.map((item: { date: string }) => item.date),
        ...normalizedData.predicted.map((item: { date: string }) => item.date),
        ...normalizedData.pastPredicted.map((item: { date: string }) => item.date),
      ]);

      const combinedData = Array.from(allDates).map((date: string) => {
        const historical = normalizedData.historical.find((item: { date: string }) => item.date === date);
        const predicted = normalizedData.predicted.find((item: { date: string }) => item.date === date);
        const pastPredicted = normalizedData.pastPredicted.find((item: { date: string }) => item.date === date);

        return {
          date,
          crowdLevel: historical?.crowdLevel ?? null,
          predictedCrowdLevel: pastPredicted?.predictedCrowdLevel ?? predicted?.predictedCrowdLevel ?? null,
        };
      });

      const finalData = combinedData.sort((a, b) => moment(a.date).diff(moment(b.date)));
      setCrowdData(finalData);
    } catch (error) {
      console.error('Error fetching crowd data:', error);
      setError('Failed to fetch crowd data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (parks.length > 0) {
      fetchData();
    }
  }, [parkId, parks]);

  return {
    crowdData,
    isLoading,
    error,
    refetch: fetchData,
  };
};