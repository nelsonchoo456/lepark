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
  parkId: number;
}

interface UseFetchCrowdDataProps {
  parkId: number;
  parks: ParkResponse[];
}

export const useFetchCrowdDataForCrowdAlerts = ({ parkId, parks }: UseFetchCrowdDataProps) => {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (parks.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
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

      // Data processing
      // Pre-calculate timezone offset once
      const sgOffset = moment.tz.zone('Asia/Singapore')?.utcOffset(Date.now()) ?? 0;

      // Create a more efficient comparison function
      const compareDates = (a: any, b: any) => {
        // Convert to timestamps directly without moment
        const dateA = new Date(a.date).getTime() + sgOffset * 60 * 1000;
        const dateB = new Date(b.date).getTime() + sgOffset * 60 * 1000;
        return dateA - dateB;
      };

      // Filter and sort in one pass using a typed array
      const sortedData = allData.data
        .reduce((acc: any[], item: any) => {
          if (item?.date) {
            acc.push(item);
          }
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

      // Fetch park data
      const fetchParkData = async (park: ParkResponse) => {
        const [historicalResponse, predictedResponse, pastPredictedResponse] = await Promise.all([
          getAggregatedCrowdDataForPark(park.id, startDate.toDate(), historicalEndDate.toDate()),
          predictCrowdLevels(park.id, 30),
          getPredictedCrowdLevelsForPark(
            park.id,
            Math.max(uniqBy(sortedData, (item) => moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD')).length - 81, 0),
          ),
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

      // Data normalization and combination
      const normalizeDate = (date: string) => moment.tz(date, 'Asia/Singapore').format('YYYY-MM-DD');

      const normalizedData = parksData.map((parkData) => ({
        parkId: parkData.parkId,
        historical: parkData.historical.map((item: any) => ({
          ...item,
          date: normalizeDate(item.date),
        })),
        predicted: parkData.predicted.map((item: any) => ({
          ...item,
          date: normalizeDate(item.date),
        })),
        pastPredicted: parkData.pastPredicted.map((item: any) => ({
          ...item,
          date: normalizeDate(item.date),
        })),
      }));

      const allDates = new Set(
        normalizedData.flatMap((parkData) => [
          ...parkData.historical.map((item: any) => item.date),
          ...parkData.predicted.map((item: any) => item.date),
          ...parkData.pastPredicted.map((item: any) => item.date),
        ]),
      );

      // Final data combination
      const finalData = Array.from(allDates)
        .flatMap((date) =>
          parksToProcess.map((park) => {
            const parkData = normalizedData.find((data) => data.parkId === park.id);
            const historical = parkData?.historical.find((item: any) => item.date === date);
            const predicted = parkData?.predicted.find((item: any) => item.date === date);
            const pastPredicted = parkData?.pastPredicted.find((item: any) => item.date === date);

            return {
              date,
              parkId: park.id,
              crowdLevel: historical?.crowdLevel ?? null,
              predictedCrowdLevel: pastPredicted?.predictedCrowdLevel ?? predicted?.predictedCrowdLevel ?? null,
            };
          }),
        )
        .sort((a, b) => moment.tz(a.date, 'Asia/Singapore').valueOf() - moment.tz(b.date, 'Asia/Singapore').valueOf());

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
