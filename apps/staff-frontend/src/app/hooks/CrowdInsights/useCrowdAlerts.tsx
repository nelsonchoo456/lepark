import { ParkResponse, getAllParks, predictCrowdLevels } from '@lepark/data-access';
import moment from 'moment';
import { calculateParkAreaAndThresholds } from '../../pages/CrowdInsight/CalculateCrowdThresholds';

export interface CrowdAlert {
  parkId: number;
  parkName: string;
  predictedCrowd: number;
  threshold: number;
  date: string;
}

export const checkForUpcomingCrowdAlerts = async (
  parkId: number = 0, // default to all parks
  days: number = 7, // default to 7 days
): Promise<CrowdAlert[]> => {
  try {
    const parksResponse = await getAllParks();
    const allParks = parksResponse.data;
    const today = moment().startOf('day');
    const endDate = moment().add(days, 'days').endOf('day');

    // Get predictions for the specified park or all parks
    const parksToCheck = parkId === 0 ? allParks : allParks.filter((p) => p.id === parkId);
    const alerts: CrowdAlert[] = [];

    // Process each park
    for (const park of parksToCheck) {
      const daysToPredict = endDate.diff(today, 'days') + 1;
      const response = await predictCrowdLevels(park.id, daysToPredict);
      const { thresholds } = calculateParkAreaAndThresholds(park.geom);

      // Check each prediction
      for (const prediction of response.data) {
        const date = moment(prediction.date);
        if (date.isBetween(today, endDate) && prediction.predictedCrowdLevel > thresholds.moderate) {
          alerts.push({
            parkId: park.id,
            parkName: park.name,
            predictedCrowd: prediction.predictedCrowdLevel,
            threshold: thresholds.moderate,
            date: prediction.date,
          });
        }
      }
    }

    // Sort alerts by date
    return alerts.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
  } catch (error) {
    console.error('Error checking for crowd alerts:', error);
    return [];
  }
};
