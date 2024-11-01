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

      const sortedData = allData.data
        .filter((item: any) => item && item.date)
        .sort((a: any, b: any) => moment.tz(a.date, 'Asia/Singapore').valueOf() - moment.tz(b.date, 'Asia/Singapore').valueOf());

      if (sortedData.length === 0) {
        setCrowdData([]);
        return;
      }

      const startDate = moment.tz(sortedData[0].date, 'Asia/Singapore').startOf('day');
      const endDate = moment.tz(sortedData[sortedData.length - 1].date, 'Asia/Singapore').endOf('day');
      const today = moment().tz('Asia/Singapore').endOf('day');
      const predictionEndDate = today.clone().add(1, 'month').endOf('day');

      // Historical data
      const historicalEndDate = today.isBefore(endDate) ? today : endDate;
      let historicalData;
      if (parkId === 0) {
        const parkHistoricalData = await Promise.all(
          parks.map((park) => getAggregatedCrowdDataForPark(park.id, startDate.toDate(), historicalEndDate.toDate())),
        );
        historicalData = parkHistoricalData[0].data.map((item: { date: any }, index: string | number) => ({
          date: item.date,
          crowdLevel: sumBy(parkHistoricalData, (parkData) => parkData.data[index].crowdLevel),
        }));
      } else {
        const historicalResponse = await getAggregatedCrowdDataForPark(parkId, startDate.toDate(), historicalEndDate.toDate());
        historicalData = historicalResponse.data;
      }

      // Future predictions
      const predictionStartDate = today.clone().add(1, 'day').startOf('day');
      const daysToPredict = predictionEndDate.diff(predictionStartDate, 'days') + 1;
      let predictedData;
      if (parkId === 0) {
        const allParksPredictions = await Promise.all(parks.map((park) => predictCrowdLevels(park.id, daysToPredict)));
        predictedData = allParksPredictions[0].data.map((item: { date: any }, index: string | number) => ({
          date: item.date,
          predictedCrowdLevel: sumBy(allParksPredictions, (prediction) => prediction.data[index].predictedCrowdLevel),
        }));
      } else {
        const predictedResponse = await predictCrowdLevels(parkId, daysToPredict);
        predictedData = predictedResponse.data;
      }

      // Past predictions
      const distinctDays = uniqBy(sortedData, (item) => moment.tz(item.date, 'Asia/Singapore').format('YYYY-MM-DD')).length;
      const pastDaysToPredict = Math.max(distinctDays - 71, 0);
      let pastPredictedData;
      if (parkId === 0) {
        const allParksPastPredictions = await Promise.all(
          parks.map((park) => getPredictedCrowdLevelsForPark(park.id, pastDaysToPredict)),
        );
        pastPredictedData = allParksPastPredictions[0].data.map((item: { date: any }, index: string | number) => ({
          date: item.date,
          predictedCrowdLevel: sumBy(allParksPastPredictions, (prediction) => prediction.data[index].predictedCrowdLevel),
        }));
      } else {
        const pastPredictedResponse = await getPredictedCrowdLevelsForPark(parkId, pastDaysToPredict);
        pastPredictedData = pastPredictedResponse.data;
      }

      // Normalize and combine data
      const normalizeDate = (date: string) => moment.tz(date, 'Asia/Singapore').format('YYYY-MM-DD');

      const normalizedData = {
        historical: historicalData.map((item: { date: string }) => ({
          ...item,
          date: normalizeDate(item.date),
        })),
        predicted: predictedData.map((item: { date: string }) => ({
          ...item,
          date: normalizeDate(item.date),
        })),
        pastPredicted: pastPredictedData.map((item: { date: string; predictedCrowdLevel: number }) => ({
          date: normalizeDate(item.date),
          predictedCrowdLevel: item.predictedCrowdLevel,
        })),
      };

      console.log(normalizedData);

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