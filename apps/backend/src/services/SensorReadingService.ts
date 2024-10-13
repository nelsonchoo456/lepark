import { SensorReading, SensorTypeEnum } from '@prisma/client';
import { z } from 'zod';
import { SensorReadingSchema, SensorReadingSchemaType } from '../schemas/sensorReadingSchema';
import SensorReadingDao from '../dao/SensorReadingDao';
import { fromZodError } from 'zod-validation-error';
import SensorDao from '../dao/SensorDao';
import ZoneDao from '../dao/ZoneDao';
import ZoneService from './ZoneService';

const dateFormatter = (data: any) => {
  const { timestamp, ...rest } = data;
  const formattedData = { ...rest };

  if (timestamp) {
    formattedData.timestamp = new Date(timestamp);
  }
  return formattedData;
};

class SensorReadingService {
  public async createSensorReading(data: SensorReadingSchemaType): Promise<SensorReading> {
    try {
      const sensor = await SensorDao.getSensorById(data.sensorId);
      if (!sensor) {
        throw new Error('Sensor not found');
      }
      const formattedData = dateFormatter(data);
      SensorReadingSchema.parse(formattedData);
      return SensorReadingDao.createSensorReading(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async updateSensorReading(id: string, data: Partial<SensorReadingSchemaType>): Promise<SensorReading> {
    try {
      const validatedData = SensorReadingSchema.partial().parse(data);
      const updatedSensorReading = await SensorReadingDao.updateSensorReading(id, validatedData);
      if (!updatedSensorReading) {
        throw new Error('Sensor reading not found');
      }
      return updatedSensorReading;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteSensorReading(id: string): Promise<void> {
    await SensorReadingDao.deleteSensorReading(id);
  }

  public async getSensorReadingsBySensorId(sensorId: string): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsBySensorId(sensorId);
  }

  public async getSensorReadingsBySensorIds(sensorIds: string[]): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsBySensorIds(sensorIds);
  }

  public async getSensorReadingsHoursAgo(sensorId: string, hours: number): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsHoursAgo(sensorId, hours);
  }

  public async getAverageSensorReadingsForHoursAgo(sensorId: string, hours: number): Promise<number> {
    return SensorReadingDao.getAverageSensorReadingsForHoursAgo(sensorId, hours);
  }

  public async getSensorReadingsByDateRange(sensorId: string, startDate: Date, endDate: Date): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsByDateRange(sensorId, startDate, endDate);
  }

  public async getLatestSensorReadingBySensorId(sensorId: string): Promise<SensorReading | null> {
    return SensorReadingDao.getLatestSensorReadingBySensorId(sensorId);
  }

  public async getSensorReadingTrendWithSlope(sensorId: string, hours: number): Promise<string> {
    const readings = await this.getSensorReadingsHoursAgo(sensorId, hours);

    if (readings.length < 2) {
      return 'No sufficient data to determine trend'; // Not enough data points
    }

    const slopes: number[] = [];
    let totalPercentageChange = 0;

    // Calculate slope (rate of change) and percentage change between consecutive readings
    for (let i = 1; i < readings.length; i++) {
      const timeDiff = (readings[i].date.getTime() - readings[i - 1].date.getTime()) / (1000 * 60); // Time difference in minutes
      const valueDiff = readings[i].value - readings[i - 1].value;

      const slope = valueDiff / timeDiff;
      slopes.push(slope);

      // Calculate percentage change
      const percentageChange = ((readings[i].value - readings[i - 1].value) / readings[i - 1].value) * 100;
      totalPercentageChange += percentageChange;
    }

    // Determine trend based on slope and percentage change
    const avgSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
    const avgPercentageChange = totalPercentageChange / slopes.length;

    // Interpret the slope and percentage change to determine trend strength
    if (avgSlope > 0 && avgPercentageChange > 1) {
      return `Increasing trend: Slope is positive with an average percentage increase of ${avgPercentageChange.toFixed(2)}%.`;
    } else if (avgSlope < 0 && avgPercentageChange < -1) {
      return `Decreasing trend: Slope is negative with an average percentage decrease of ${avgPercentageChange.toFixed(2)}%.`;
    } else if (avgSlope === 0 || Math.abs(avgPercentageChange) < 1) {
      return 'Stable trend: Little to no change detected.';
    } else {
      return 'Fluctuating trend: Mixed slope and changes detected.';
    }
  }

  // Hub
  public async getAllSensorReadingsByHubIdAndSensorType(hubId: string, sensorType: SensorTypeEnum): Promise<SensorReading[]> {
    return SensorReadingDao.getAllSensorReadingsByHubIdAndSensorType(hubId, sensorType);
  }

  public async getSensorReadingsByHubIdAndSensorTypeForHoursAgo(
    hubId: string,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsByHubIdAndSensorTypeForHoursAgo(hubId, sensorType, hours);
  }

  public async getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo(
    hubId: string,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<number> {
    const readings = await this.getSensorReadingsByHubIdAndSensorTypeForHoursAgo(hubId, sensorType, hours);
    if (readings.length === 0) {
      return 0;
    }
    return readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length;
  }

  public async getSensorReadingsByHubIdAndSensorTypeByDateRange(
    hubId: string,
    sensorType: SensorTypeEnum,
    startDate: Date,
    endDate: Date,
  ): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsByHubIdAndSensorTypeByDateRange(hubId, sensorType, startDate, endDate);
  }

  public async getLatestSensorReadingByHubIdAndSensorType(hubId: string, sensorType: SensorTypeEnum): Promise<SensorReading | null> {
    return SensorReadingDao.getLatestSensorReadingByHubIdAndSensorType(hubId, sensorType);
  }

  // Zone
  public async getAllSensorReadingsByZoneIdAndSensorType(zoneId: number, sensorType: SensorTypeEnum): Promise<SensorReading[]> {
    return SensorReadingDao.getAllSensorReadingsByZoneIdAndSensorType(zoneId, sensorType);
  }

  public async getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(
    zoneId: number,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(zoneId, sensorType, hours);
  }

  public async getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo(
    zoneId: number,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<number> {
    const readings = await this.getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(zoneId, sensorType, hours);
    if (readings.length === 0) {
      return 0;
    }
    return readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length;
  }

  public async getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo(
    zoneId: number,
    hours: number,
  ): Promise<{ [sensorType: string]: number }> {
    const sensorTypes = Object.values(SensorTypeEnum);
    const averages: { [sensorType: string]: number } = {};

    for (const sensorType of sensorTypes) {
      const average = await SensorReadingDao.getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo(zoneId, sensorType, hours);
      averages[sensorType] = average;
    }

    return averages;
  }
  

  public async getSensorReadingsByZoneIdAndSensorTypeByDateRange(
    zoneId: number,
    sensorType: SensorTypeEnum,
    startDate: Date,
    endDate: Date,
  ): Promise<SensorReading[]> {
    return SensorReadingDao.getSensorReadingsByZoneIdAndSensorTypeByDateRange(zoneId, sensorType, startDate, endDate);
  }

  public async getLatestSensorReadingByZoneIdAndSensorType(zoneId: number, sensorType: SensorTypeEnum): Promise<SensorReading | null> {
    return SensorReadingDao.getLatestSensorReadingByZoneIdAndSensorType(zoneId, sensorType);
  }

  public async getActiveZoneSensorCount(zoneId: number, hoursAgo = 1): Promise<any> {
    return SensorReadingDao.getActiveZoneSensorCount(zoneId, hoursAgo);
  }

  public async;

  // Not sure if working as expected
  public async getZoneTrendForSensorType(zoneId: number, sensorType: SensorTypeEnum, hours: number): Promise<string> {
    const readings = await this.getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(zoneId, sensorType, hours);

    if (readings.length < 2) {
      return 'Insufficient data: Not enough readings to determine a trend.';
    }

    // Sort readings by date in ascending order
    readings.sort((a, b) => a.date.getTime() - b.date.getTime());

    const slopes: number[] = [];
    let totalPercentageChange = 0;

    for (let i = 1; i < readings.length; i++) {
      const timeDiff = (readings[i].date.getTime() - readings[i - 1].date.getTime()) / (1000 * 60 * 60); // Time difference in hours
      const valueDiff = readings[i].value - readings[i - 1].value;

      const slope = valueDiff / timeDiff;
      slopes.push(slope);

      const percentageChange = ((readings[i].value - readings[i - 1].value) / readings[i - 1].value) * 100;
      totalPercentageChange += percentageChange;
    }

    const avgSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
    const avgPercentageChange = totalPercentageChange / (readings.length - 1);

    const latestReading = readings[readings.length - 1].value;
    const oldestReading = readings[0].value;
    const overallChange = ((latestReading - oldestReading) / oldestReading) * 100;

    let trendDescription = '';
    if (Math.abs(avgSlope) < 0.1 && Math.abs(avgPercentageChange) < 1) {
      trendDescription = 'Stable';
    } else if (avgSlope > 0) {
      trendDescription = avgPercentageChange > 5 ? 'Rapidly increasing' : 'Gradually increasing';
    } else {
      trendDescription = avgPercentageChange < -5 ? 'Rapidly decreasing' : 'Gradually decreasing';
    }

    return `
      Trend analysis for ${sensorType} in Zone ${zoneId} over the past ${hours} hours:
      - ${trendDescription}
      - Average rate of change: ${avgSlope.toFixed(2)} units per hour
      - Average percentage change between readings: ${avgPercentageChange.toFixed(2)}%
      - Overall change from oldest to latest reading: ${overallChange.toFixed(2)}%
      - Number of readings analyzed: ${readings.length}
    `;
  }

  public async getAverageDifferenceBetweenPeriodsBySensorType(
    zoneId: number,
    duration: number,
  ): Promise<{ [sensorType in SensorTypeEnum]: { firstPeriodAvg: number; secondPeriodAvg: number; difference: number } }> {
    return SensorReadingDao.getAverageDifferenceBetweenPeriodsBySensorType(zoneId, duration);
  }
}

export default new SensorReadingService();
