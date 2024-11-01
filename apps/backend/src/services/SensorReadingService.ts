import { LightTypeEnum, SensorReading, SensorTypeEnum } from '@prisma/client';
import { z } from 'zod';
import { SensorReadingSchema, SensorReadingSchemaType } from '../schemas/sensorReadingSchema';
import SensorReadingDao from '../dao/SensorReadingDao';
import { fromZodError } from 'zod-validation-error';
import SensorDao from '../dao/SensorDao';
import ZoneDao from '../dao/ZoneDao';
import ZoneService from './ZoneService';
import SpeciesService from './SpeciesService';
import OccurrenceService from './OccurrenceService';
import { OccurrenceWithDetails } from './OccurrenceService';
import OccurrenceDao from '../dao/OccurrenceDao';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';
import { getAugumentedDataset } from '../utils/holtwinters';

const dateFormatter = (data: any) => {
  const { timestamp, ...rest } = data;
  const formattedData = { ...rest };

  if (timestamp) {
    formattedData.timestamp = new Date(timestamp);
  }
  return formattedData;
};

const enumFormatter = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
    // Adjust the end date to include the entire day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    return SensorReadingDao.getSensorReadingsByDateRange(sensorId, startDate, adjustedEndDate);
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

  public async getHourlyAverageSensorReadingsByDateRange(
    sensorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; average: number }[]> {
    // Adjust both start and end dates to ensure full day coverage
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const readings = await this.getSensorReadingsByDateRange(sensorId, adjustedStartDate, adjustedEndDate);

    const hourlyAverages = new Map<string, { sum: number; count: number }>();

    readings.forEach((reading) => {
      const hourKey = new Date(reading.date).toISOString().slice(0, 13) + ':00:00.000Z';
      const current = hourlyAverages.get(hourKey) || { sum: 0, count: 0 };
      hourlyAverages.set(hourKey, {
        sum: current.sum + reading.value,
        count: current.count + 1,
      });
    });

    return Array.from(hourlyAverages.entries())
      .map(([hourKey, { sum, count }]) => ({
        date: hourKey,
        average: Number((sum / count).toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  public async getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(
    hubId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ [sensorType: string]: { date: string; average: number }[] }> {
    // Adjust both start and end dates to ensure full day coverage
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const sensorTypes = Object.values(SensorTypeEnum);
    const result: { [sensorType: string]: { date: string; average: number }[] } = {};

    for (const sensorType of sensorTypes) {
      const readings = await SensorReadingDao.getSensorReadingsByHubIdAndSensorTypeByDateRange(hubId, sensorType, adjustedStartDate, adjustedEndDate);

      const hourlyAverages = new Map<string, { sum: number; count: number }>();

      readings.forEach((reading) => {
        const hourKey = new Date(reading.date).toISOString().slice(0, 13) + ':00:00.000Z';
        const current = hourlyAverages.get(hourKey) || { sum: 0, count: 0 };
        hourlyAverages.set(hourKey, {
          sum: current.sum + reading.value,
          count: current.count + 1,
        });
      });

      result[sensorType] = Array.from(hourlyAverages.entries())
        .map(([hourKey, { sum, count }]) => ({
          date: hourKey,
          average: Number((sum / count).toFixed(2)),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return result;
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

  public async getAverageSensorReadingsForHubIdAcrossAllSensorTypesForHoursAgo(
    hubId: string,
    hours: number,
  ): Promise<{ [sensorType: string]: number }> {
    const sensorTypes = Object.values(SensorTypeEnum);
    const averages: { [sensorType: string]: number } = {};

    for (const sensorType of sensorTypes) {
      const average = await SensorReadingDao.getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo(hubId, sensorType, hours);
      averages[sensorType] = average;
    }

    return averages;
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

  public async getActiveZonePlantSensorCount(zoneId: number, hoursAgo = 1): Promise<any> {
    return SensorReadingDao.getActiveZonePlantSensorCount(zoneId, hoursAgo);
  }

  public async getZoneTrendForSensorType(
    zoneId: number,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<{
    trendDescription: string;
    absoluteChange: string;
    rateOfChange: string;
    directionOfChange: string;
    magnitudeOfChange: string;
    actionableInsight: string;
    readingsCount: number;
    unit: string;
  }> {
    try {
      const zone = await ZoneDao.getZoneById(zoneId);
      if (!zone) {
        throw new Error('Zone not found');
      }

      const sensors = await SensorDao.getSensorsByZoneIdAndType(zoneId, sensorType);
      if (sensors.length === 0) {
        throw new Error('No sensors found for this zone and sensor type');
      }

      let totalAbsoluteChange = 0;
      let totalRateOfChange = 0;
      let totalReadings = 0;
      let validSensorsCount = 0;
      let totalTimeSpanHours = 0;

      for (const sensor of sensors) {
        const readings = await this.getSensorReadingsHoursAgo(sensor.id, hours);

        // at least 2 readings
        if (readings.length >= 2) {
          readings.sort((a, b) => a.date.getTime() - b.date.getTime());
          const oldestReading = readings[0];
          const latestReading = readings[readings.length - 1];
          const timeSpanHours = (latestReading.date.getTime() - oldestReading.date.getTime()) / (1000 * 60 * 60);
          totalTimeSpanHours += timeSpanHours;
          // must be at least 1/2 of hours between latest reading and oldest reading
          if (timeSpanHours >= hours * 0.5) {
            const absoluteChange = latestReading.value - oldestReading.value;
            const rateOfChange = absoluteChange / timeSpanHours;

            totalAbsoluteChange += absoluteChange;
            totalRateOfChange += rateOfChange;
            totalReadings += readings.length;
            validSensorsCount++;
          }
        }
      }

      if (validSensorsCount === 0) {
        return {
          trendDescription: 'Insufficient readings to determine a trend.',
          absoluteChange: 'N/A',
          rateOfChange: 'N/A',
          directionOfChange: 'N/A',
          magnitudeOfChange: 'N/A',
          actionableInsight: 'Collect more data to analyze trends.',
          readingsCount: totalReadings,
          unit: this.getSensorUnit(sensorType),
        };
      }

      const averageAbsoluteChange = totalAbsoluteChange / validSensorsCount;
      const averageRateOfChange = totalRateOfChange / validSensorsCount;
      const averageTimeSpanHours = totalTimeSpanHours / validSensorsCount;

      // Calculate percentage change based on the average absolute change
      const percentageChange = (averageAbsoluteChange / 100) * 100; // Assuming a base value of 100 for percentage calculation

      const directionOfChange = averageAbsoluteChange > 0 ? 'Increasing' : averageAbsoluteChange < 0 ? 'Decreasing' : 'Stable';

      let magnitudeOfChange: string;
      if (Math.abs(percentageChange) < 1) {
        magnitudeOfChange = 'Minimal';
      } else if (Math.abs(percentageChange) < 5) {
        magnitudeOfChange = 'Small';
      } else if (Math.abs(percentageChange) < 10) {
        magnitudeOfChange = 'Moderate';
      } else {
        magnitudeOfChange = 'Large';
      }

      const trendDescription = `${magnitudeOfChange} ${directionOfChange.toLowerCase()}`;

      const actionableInsight = this.getActionableInsight(
        sensorType,
        trendDescription,
        averageAbsoluteChange,
        averageRateOfChange,
        averageTimeSpanHours,
      );

      return {
        trendDescription,
        absoluteChange: `${averageAbsoluteChange.toFixed(2)} ${this.getSensorUnit(sensorType)}`,
        rateOfChange: `${averageRateOfChange.toFixed(2)} ${this.getSensorUnit(sensorType)} per hour`,
        directionOfChange,
        magnitudeOfChange,
        actionableInsight,
        readingsCount: totalReadings,
        unit: this.getSensorUnit(sensorType),
      };
    } catch (error) {
      console.error('Error getting zone trend for sensor type:', error);
      return {
        trendDescription: 'Error getting zone trend for sensor type',
        absoluteChange: 'N/A',
        rateOfChange: 'N/A',
        directionOfChange: 'N/A',
        magnitudeOfChange: 'N/A',
        actionableInsight: 'No actionable insight available.',
        readingsCount: 0,
        unit: 'N/A',
      };
    }
  }

  private getActionableInsight(
    sensorType: SensorTypeEnum,
    trendDescription: string,
    absoluteChange: number,
    rateOfChange: number,
    timeSpanHours: number,
  ): string {
    const currentTime = new Date(); // Get the current time

    switch (sensorType) {
      case SensorTypeEnum.TEMPERATURE:
        return `Temperature has shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(2)} °C over ${timeSpanHours.toFixed(
          2,
        )} hours (${rateOfChange.toFixed(2)} °C / hour). ${this.getTemperatureInsight(absoluteChange, rateOfChange, currentTime)}`;
      case SensorTypeEnum.HUMIDITY:
        return `Humidity has shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(2)} % over ${timeSpanHours.toFixed(
          2,
        )} hours (${rateOfChange.toFixed(2)} % / hour). ${this.getHumidityInsight(absoluteChange, rateOfChange, currentTime)}`;
      case SensorTypeEnum.SOIL_MOISTURE:
        return `Soil moisture has shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(2)}% over ${timeSpanHours.toFixed(
          2,
        )} hours (${rateOfChange.toFixed(2)} % / hour). ${this.getSoilMoistureInsight(absoluteChange, rateOfChange, currentTime)}`;
      case SensorTypeEnum.LIGHT:
        return `Light levels have shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(
          2,
        )} Lux over ${timeSpanHours.toFixed(2)} hours (${rateOfChange.toFixed(2)} Lux / hour). ${this.getLightInsight(
          absoluteChange,
          rateOfChange,
          currentTime,
        )}`;
      default:
        return `The sensor readings have shown a ${trendDescription} trend. Monitor the situation and adjust conditions if necessary.`;
    }
  }

  private getTemperatureInsight(absoluteChange: number, rateOfChange: number, currentTime: Date): string {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      if (rateOfChange < 0) {
        return `Unexpected morning temperature drop. Monitor for any sudden weather changes or shading issues.`;
      } else if (rateOfChange > 2) {
        return `Temperature rising quickly. Ensure plants are protected from heat stress as the day warms up.`;
      }
      return `Temperature rising normally for morning hours. Keep an eye on any sudden heat spikes.`;
    } else if (hour >= 12 && hour < 18) {
      if (Math.abs(rateOfChange) > 1) {
        return `Significant temperature fluctuations during peak heat. Ensure plants have adequate shade and hydration.`;
      }
      return `Temperature stable during the afternoon heat. Watch for signs of heat stress, especially in exposed areas.`;
    } else {
      if (rateOfChange > 0) {
        return `Unusual temperature rise in the evening. Investigate potential heat sources or malfunctioning equipment.`;
      } else if (rateOfChange < -2) {
        return `Rapid temperature drop in the evening. Ensure plants sensitive to temperature changes are protected.`;
      }
      return `Temperature cooling down as expected. No immediate action required.`;
    }
  }

  private getHumidityInsight(absoluteChange: number, rateOfChange: number, currentTime: Date): string {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      if (rateOfChange < -2) {
        return `Humidity dropping quickly this morning. Consider light misting for moisture-sensitive plants.`;
      }
      return `Morning humidity changes are typical. No immediate action needed.`;
    } else if (hour >= 12 && hour < 18) {
      if (rateOfChange < -1) {
        return `Humidity decreasing during peak hours. Ensure plants have adequate water to cope with the heat.`;
      }
      return `Humidity levels are stable for midday. Continue regular monitoring.`;
    } else {
      if (rateOfChange > 2) {
        return `Humidity increasing rapidly in the evening. Monitor for potential fungal growth in sensitive plants.`;
      }
      return `Evening humidity levels are typical. Watch for signs of excess moisture on foliage.`;
    }
  }

  private getSoilMoistureInsight(absoluteChange: number, rateOfChange: number, currentTime: Date): string {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      if (rateOfChange < -2) {
        return `Soil moisture decreasing faster than usual this morning. Check for drainage issues or adjust watering schedules.`;
      }
      return `Morning soil moisture levels are stable. Continue regular irrigation checks.`;
    } else if (hour >= 12 && hour < 18) {
      if (rateOfChange < -3) {
        return `Rapid soil moisture loss during peak heat. Increase watering for plants in sunny or high-traffic areas.`;
      }
      return `Soil moisture stable during peak hours. Monitor plants in exposed areas for signs of stress.`;
    } else {
      if (rateOfChange > 2 && absoluteChange > 10) {
        return `Unexpected increase in soil moisture this evening. Check for overwatering or potential irrigation system issues.`;
      }
      return `Evening soil moisture levels are normal. Adjust irrigation schedules if necessary.`;
    }
  }

  private getLightInsight(absoluteChange: number, rateOfChange: number, currentTime: Date): string {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      if (rateOfChange < 50) {
        return `Morning light levels rising slower than expected. Check for cloud cover or shading.`;
      }
      return `Light levels increasing as expected. Protect shade-loving plants from morning sun.`;
    } else if (hour >= 12 && hour < 18) {
      if (Math.abs(rateOfChange) > 100) {
        return `Midday light fluctuating significantly. Check for sudden weather changes or intermittent shading.`;
      }
      return `Midday light levels are stable. Monitor plants sensitive to intense sunlight.`;
    } else {
      if (hour < 21 && rateOfChange > -50) {
        return `Light levels decreasing slowly in the evening. Check for artificial lighting that may disrupt plant cycles.`;
      }
      return `Evening light levels dropping as expected. Ensure any artificial lights are adjusted for plant photoperiods.`;
    }
  }

  private getSensorUnit(sensorType: SensorTypeEnum): string {
    switch (sensorType) {
      case SensorTypeEnum.TEMPERATURE:
        return '°C';
      case SensorTypeEnum.HUMIDITY:
      case SensorTypeEnum.SOIL_MOISTURE:
        return '%';
      case SensorTypeEnum.LIGHT:
        return 'Lux';
      default:
        return '';
    }
  }

  // Compare 4 hours to 8 hours ago (for example)
  public async getAverageDifferenceBetweenPeriodsBySensorType(
    zoneId: number,
    duration: number,
  ): Promise<{ [sensorType in SensorTypeEnum]: { firstPeriodAvg: number; secondPeriodAvg: number; difference: number } }> {
    return SensorReadingDao.getAverageDifferenceBetweenPeriodsBySensorType(zoneId, duration);
  }

  // Get unhealthy occurrences that exceed their ideal conditions (based on nearest sensor whenever available)
  public async getUnhealthyOccurrences(
    zoneId: number,
  ): Promise<{ occurrenceId: string; occurrenceName: string; speciesName: string; issues: string[] }[]> {
    const occurrences: OccurrenceWithDetails[] = await OccurrenceService.getAllOccurrenceByZoneId(zoneId);
    const unhealthyOccurrences = [];

    for (const occurrence of occurrences) {
      const speciesConditions = await SpeciesService.getSpeciesIdealConditions(occurrence.speciesId);
      const issues = [];

      const sensorTypes = [SensorTypeEnum.TEMPERATURE, SensorTypeEnum.HUMIDITY, SensorTypeEnum.SOIL_MOISTURE, SensorTypeEnum.LIGHT];
      let hasRecentReading = false;

      for (const sensorType of sensorTypes) {
        const latestReading = await this.getLatestSensorReadingForOccurrence(zoneId, sensorType, occurrence.id);

        if (latestReading && this.isReadingRecent(latestReading)) {
          hasRecentReading = true;

          switch (sensorType) {
            case SensorTypeEnum.TEMPERATURE:
              if (latestReading.value < speciesConditions.minTemp || latestReading.value > speciesConditions.maxTemp) {
                issues.push(
                  `Temperature out of range: ${latestReading.value}°C (Recommended: ${speciesConditions.minTemp}°C - ${speciesConditions.maxTemp}°C)`,
                );
              }
              break;
            case SensorTypeEnum.HUMIDITY:
              if (Math.abs(latestReading.value - speciesConditions.idealHumidity) > 10) {
                issues.push(`Humidity not ideal: ${latestReading.value}% (Recommended: ${speciesConditions.idealHumidity}%)`);
              }
              break;
            case SensorTypeEnum.SOIL_MOISTURE:
              if (Math.abs(latestReading.value - speciesConditions.soilMoisture) > 10) {
                issues.push(`Soil moisture not ideal: ${latestReading.value}% (Recommended: ${speciesConditions.soilMoisture}%)`);
              }
              break;
            case SensorTypeEnum.LIGHT: {
              const lightIssue = this.checkLightCondition(latestReading.value, speciesConditions.lightType);
              if (lightIssue) {
                issues.push(
                  `Light level not ideal: ${latestReading.value} Lux (Recommended: ${this.getLightLuxRecommendation(
                    speciesConditions.lightType,
                  )})`,
                );
              }
              break;
            }
          }
        }
      }

      if (hasRecentReading && issues.length > 0) {
        unhealthyOccurrences.push({
          occurrenceId: occurrence.id,
          occurrenceName: occurrence.title,
          speciesName: occurrence.species.speciesName,
          issues,
        });
      }
    }

    return unhealthyOccurrences;
  }

  private isReadingRecent(reading: SensorReading): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return reading.date >= oneHourAgo;
  }

  private checkLightCondition(lightValue: number, idealLightType: LightTypeEnum): string | null {
    // This is a simplified check. You might need to adjust these thresholds based on your specific requirements
    switch (idealLightType) {
      case LightTypeEnum.FULL_SUN:
        return lightValue < 200 ? 'Light level too low for full sun species' : null;
      case LightTypeEnum.PARTIAL_SHADE:
        return lightValue < 50 || lightValue >= 200 ? 'Light level not ideal for partial shade species' : null;
      case LightTypeEnum.FULL_SHADE:
        return lightValue > 50 ? 'Light level too high for full shade species' : null;
      default:
        return null;
    }
  }

  private getLightLuxRecommendation(lightType: LightTypeEnum): string {
    switch (lightType) {
      case LightTypeEnum.FULL_SUN:
        return '> 200 Lux';
      case LightTypeEnum.PARTIAL_SHADE:
        return '50 - 200 Lux';
      case LightTypeEnum.FULL_SHADE:
        return '< 50 Lux';
      default:
        return '0 Lux';
    }
  }

  // Get the latest sensor reading for an occurrence (based on nearest sensor)
  public async getLatestSensorReadingForOccurrence(
    zoneId: number,
    sensorType: SensorTypeEnum,
    occurrenceId: string,
  ): Promise<SensorReading | null> {
    try {
      // Get the occurrence details
      const occurrence = await OccurrenceDao.getOccurrenceById(occurrenceId);
      if (!occurrence) {
        throw new Error('Occurrence not found');
      }

      // Get all sensors of the specified type in the zone
      const sensors = await SensorDao.getSensorsByZoneIdAndType(zoneId, sensorType);
      if (sensors.length === 0) {
        return null; // No sensors of this type in the zone
      }

      // Calculate distances and find the nearest sensor
      const nearestSensor = sensors.reduce(
        (nearest, sensor) => {
          const distance = this.calculateDistance(occurrence.lat, occurrence.lng, sensor.lat, sensor.long);
          return distance < nearest.distance ? { sensor, distance } : nearest;
        },
        { sensor: sensors[0], distance: Infinity },
      ).sensor;

      // Get the latest reading for the nearest sensor
      return SensorReadingDao.getLatestSensorReadingBySensorId(nearestSensor.id);
    } catch (error) {
      console.error('Error getting latest sensor reading for occurrence:', error);
      throw error;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance between two points on a sphere
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  public async getAllSensorReadingsByParkIdAndSensorType(parkId: number, sensorType: SensorTypeEnum): Promise<SensorReading[]> {
    const zones = await ZoneDao.getZonesByParkId(parkId);
    let allReadings = [];

    for (const zone of zones) {
      const readings = await SensorReadingDao.getSensorReadingsByZoneIdAndSensorType(zone.id, sensorType);
      allReadings = allReadings.concat(readings);
    }
    return allReadings;
  }

  public async predictCrowdLevels(parkId: number, daysToPredict: number): Promise<{ date: Date; predictedCrowdLevel: number }[]> {
    const allData = await this.getAllSensorReadingsByParkIdAndSensorType(parkId, SensorTypeEnum.CAMERA);
    const endDate = allData[allData.length - 1].date;
    const startDate = allData[0].date;

    const historicalData = await this.getAggregatedCrowdDataForPark(parkId, startDate, endDate);

    if (historicalData.length < 2) {
      throw new Error('Insufficient data for prediction');
    }

    // Aggregate data by day
    const dailyData = historicalData.reduce((acc, { date, crowdLevel }) => {
      const day = new Date(date).setHours(0, 0, 0, 0);
      if (!acc[day]) {
        acc[day] = { total: 0, count: 0 };
      }
      acc[day].total += crowdLevel;
      acc[day].count += 1;
      return acc;
    }, {});

    const dailyCrowdLevels = Object.entries(dailyData).map(
      ([day, data]: [string, { total: number; count: number }]) => data.total / data.count,
    );

    // Use the Holt-Winters algorithm to predict future crowd levels
    const predictions = getAugumentedDataset(dailyCrowdLevels, daysToPredict);
    // console.log('predictions', predictions);

    // Format the predictions into an array of objects with dates and predicted crowd levels
    const lastHistoricalDate = new Date(Math.max(...Object.keys(dailyData).map(Number)));
    return predictions.augumentedDataset.map((prediction, index) => ({
      date: new Date(lastHistoricalDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000), // Add days
      predictedCrowdLevel: prediction,
    }));
  }

  // aggregates all camera sensor readings across all zones in a park and calculates the average crowd level for each day
  /*
  aggregation logic:
  1. First averages readings by hour for each camera
  2. Then averages the hours to get a daily zone average
  3. Finally sums the zone averages for the park total

      Park A
    ├── Zone 1
    │   ├── Camera 1 (old): 1 reading per hour = 100
    │   └── Camera 2 (new): 720 readings per hour ≈ 200
    │   Hour Average = (100 + 200) / 2 = 150
    │   Zone 1 Daily Average = average of all hourly averages
    └── Zone 2
        ├── Camera 3: readings...
        └── Camera 4: readings...
        Hour Average = ...
        Zone 2 Daily Average = average of all hourly averages
    Park Total = Zone 1 Daily Average + Zone 2 Daily Average

  some considerations:
  1. It doesn't distinguish between different times of day. A very busy morning and a quiet evening would average out.
  2. It treats all zones equally. If some zones are much larger or more significant than others, this might not be ideal.
  3. If there are multiple cameras in a single zone, their readings are being treated individually rather than averaged per zone first.
  */
  public async getAggregatedCrowdDataForPark(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: Date; crowdLevel: number }[]> {
    const zones = await ZoneDao.getZonesByParkId(parkId);

    // Group readings by date and hour
    const readingsByDateHour: Record<string, { zoneReadings: Record<number, Record<number, number[]>> }> = {};

    // Collect all readings grouped by date, hour, and zone
    for (const zone of zones) {
      const readings = await SensorReadingDao.getSensorReadingsByZoneIdAndSensorTypeByDateRange(
        zone.id,
        SensorTypeEnum.CAMERA,
        startDate,
        endDate,
      );

      for (const reading of readings) {
        const date = new Date(reading.date);
        const day = date.setHours(0, 0, 0, 0).toString();
        const hour = date.getHours();

        if (!readingsByDateHour[day]) {
          readingsByDateHour[day] = { zoneReadings: {} };
        }

        if (!readingsByDateHour[day].zoneReadings[zone.id]) {
          readingsByDateHour[day].zoneReadings[zone.id] = {};
        }

        if (!readingsByDateHour[day].zoneReadings[zone.id][hour]) {
          readingsByDateHour[day].zoneReadings[zone.id][hour] = [];
        }

        readingsByDateHour[day].zoneReadings[zone.id][hour].push(reading.value);
      }
    }

    // Calculate averages hierarchically
    return Object.entries(readingsByDateHour)
      .map(([day, data]) => {
        // Calculate daily average for each zone
        const zoneAverages = Object.entries(data.zoneReadings).map(([_, zoneHourlyReadings]) => {
          // First average each hour's readings
          const hourlyAverages = Object.values(zoneHourlyReadings).map(
            (readings) => readings.reduce((sum, val) => sum + val, 0) / readings.length,
          );

          // Then average all hours for the zone
          return hourlyAverages.reduce((sum, val) => sum + val, 0) / hourlyAverages.length;
        });

        // Sum up all zone averages for park total
        const parkTotal = zoneAverages.reduce((sum, val) => sum + val, 0);

        return {
          date: new Date(parseInt(day)),
          crowdLevel: parkTotal,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  public async getPredictedCrowdLevelsForPark(
    parkId: number,
    pastPredictedDays: number,
  ): Promise<{ date: Date; predictedCrowdLevel: number }[]> {
    const allData = await this.getAllSensorReadingsByParkIdAndSensorType(parkId, SensorTypeEnum.CAMERA);
    if (allData.length === 0) {
      throw new Error('No sensor data available');
    }

    const latestDate = new Date(Math.max(...allData.map((reading) => reading.date.getTime())));
    const startDate = new Date(Math.min(...allData.map((reading) => reading.date.getTime())));

    // Calculate the end date for historical data
    const historicalEndDate = new Date(latestDate);
    historicalEndDate.setDate(latestDate.getDate() - pastPredictedDays);

    // console.log('Latest date:', latestDate.toISOString());
    // console.log('Historical end date:', historicalEndDate.toISOString());
    // console.log('Start date:', startDate.toISOString());

    const historicalData = await this.getAggregatedCrowdDataForPark(parkId, startDate, historicalEndDate);

    if (historicalData.length < 2) {
      throw new Error('Insufficient data for prediction');
    }

    // Aggregate data by day
    const dailyData = historicalData.reduce((acc, { date, crowdLevel }) => {
      const day = new Date(date).setHours(0, 0, 0, 0);
      if (!acc[day]) {
        acc[day] = { total: 0, count: 0 };
      }
      acc[day].total += crowdLevel;
      acc[day].count += 1;
      return acc;
    }, {});

    const dailyCrowdLevels = Object.entries(dailyData).map(
      ([day, data]: [string, { total: number; count: number }]) => data.total / data.count,
    );

    // Use the Holt-Winters algorithm to predict future crowd levels
    const predictions = getAugumentedDataset(dailyCrowdLevels, pastPredictedDays);
    // console.log('predictions', predictions);

    // Format the predictions into an array of objects with dates and predicted crowd levels
    const lastHistoricalDate = new Date(Math.max(...Object.keys(dailyData).map(Number)));
    return predictions.augumentedDataset.map((prediction, index) => ({
      date: new Date(lastHistoricalDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000), // Add days
      predictedCrowdLevel: prediction,
    }));
  }

  // Get the average crowd level reading from each camera sensor in the park for the past hour
  public async getPastOneHourCrowdDataBySensorsForPark(parkId: number): Promise<Array<{
    sensorId: string;
    lat: number;
    long: number;
    averageValue: number;
    readingCount: number;
  }>> {
    try {
      const zones = await ZoneDao.getZonesByParkId(parkId);
      let sensorAverages = [];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
      for (const zone of zones) {
        // Get all camera sensors in the zone
        const sensors = await SensorDao.getSensorsByZoneIdAndType(zone.id, SensorTypeEnum.CAMERA);
        
        for (const sensor of sensors) {
          // Get all readings from the past hour for this sensor
          const readings = await SensorReadingDao.getSensorReadingsByDateRange(
            sensor.id,
            oneHourAgo,
            new Date()
          );
          console.log('readings for sensor', sensor.id, readings);
          
          // Only include sensors that have readings in the last hour
          if (readings.length > 0) {
            const sum = readings.reduce((acc, reading) => acc + reading.value, 0);
            const average = Number((sum / readings.length).toFixed(2));
            
            sensorAverages.push({
              sensorId: sensor.id,
              lat: sensor.lat,
              long: sensor.long,
              averageValue: average,
              readingCount: readings.length
            });
          }
        }
      }
  
      return sensorAverages;
    } catch (error) {
      console.error('Error getting past hour crowd data by sensors:', error);
      throw error;
    }
  }
}

export default new SensorReadingService();
