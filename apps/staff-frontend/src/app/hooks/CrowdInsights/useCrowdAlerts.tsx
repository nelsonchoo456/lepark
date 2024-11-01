import { useState, useEffect, useMemo } from 'react';
import { ParkResponse } from '@lepark/data-access';
import moment from 'moment';
import { calculateParkAreaAndThresholds } from '../../pages/CrowdInsight/CalculateCrowdThresholds';
import { useFetchCrowdDataForCrowdAlerts } from './useFetchCrowdDataForCrowdAlerts';

export interface CrowdAlert {
  parkId: number;
  parkName: string;
  predictedCrowd: number;
  threshold: number;
  date: string;
}

interface UseCrowdAlertsProps {
  parkId?: number;
  parks: ParkResponse[];
  days?: number;
}

interface CrowdData {
  date: string;
  crowdLevel: number | null;
  predictedCrowdLevel: number | null;
  parkId: number;
}

export const useCrowdAlerts = ({ parkId = 0, parks, days = 7 }: UseCrowdAlertsProps) => {
  const [alerts, setAlerts] = useState<CrowdAlert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize parksToProcess to prevent unnecessary recalculations
  const parksToProcess = useMemo(() => 
    parkId === 0 ? parks : parks.filter((p) => p.id === parkId),
    [parkId, parks]
  );

  // Fetch crowd data for the current park configuration
  const { crowdData, isLoading: isCrowdDataLoading, error: crowdDataError } = useFetchCrowdDataForCrowdAlerts({
    parkId: parkId,
    parks: parksToProcess,
  });

  // Helper function to process alerts for a single park
  const processParksAlerts = (
    park: ParkResponse,
    crowdData: CrowdData[],
    dateRange: { startDate: moment.Moment; endDate: moment.Moment }
  ): CrowdAlert[] => {
    const { thresholds } = calculateParkAreaAndThresholds(park.geom);
  
    // Filter crowd data for this specific park when parkId is available
    const parkCrowdData = parkId === 0 
      ? crowdData.filter(data => data.parkId === park.id)
      : crowdData;
  
    return parkCrowdData
      .filter((data) => {
        const date = moment(data.date);
        return (
          data.predictedCrowdLevel !== null &&
          data.predictedCrowdLevel > thresholds.moderate &&
          date.isSameOrAfter(dateRange.startDate) &&
          date.isSameOrBefore(dateRange.endDate)
        );
      })
      .map((data) => ({
        parkId: park.id,
        parkName: park.name,
        predictedCrowd: data.predictedCrowdLevel!,
        threshold: thresholds.moderate,
        date: data.date,
      }));
  };
  
  // Helper function to sort alerts
  const sortAlerts = (alerts: CrowdAlert[]): CrowdAlert[] => {
    return alerts.sort((a, b) => {
      const dateCompare = moment(a.date).diff(moment(b.date));
      return dateCompare === 0 ? b.predictedCrowd - a.predictedCrowd : dateCompare;
    });
  };

  useEffect(() => {
    if (isCrowdDataLoading || !crowdData || crowdData.length === 0) return;

    const processAllAlerts = () => {
      try {
        setIsProcessing(true);
        const dateRange = {
          startDate: moment().startOf('day'),
          endDate: moment().add(days, 'days').endOf('day'),
        };

        const newAlerts: CrowdAlert[] = [];

        // Process alerts for each park
        parksToProcess.forEach(park => {
          const parkAlerts = processParksAlerts(park, crowdData, dateRange);
          newAlerts.push(...parkAlerts);
        });

        setAlerts(sortAlerts(newAlerts));
        setError(null);
      } catch (err) {
        console.error('Error processing alerts:', err);
        setError('Failed to process alerts');
      } finally {
        setIsProcessing(false);
      }
    };

    processAllAlerts();
  }, [crowdData, parksToProcess, days]);

  return {
    alerts,
    isLoading: isCrowdDataLoading || isProcessing,
    error: error || crowdDataError,
  };
};