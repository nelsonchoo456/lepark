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
    const readings = await this.getSensorReadingsByDateRange(sensorId, startDate, endDate);

    const hourlyAverages = new Map<string, { sum: number; count: number }>();

    readings.forEach((reading) => {
      const hourKey = new Date(reading.date).toISOString().slice(0, 13) + ':00:00.000Z'; // Group by year, month, day, hour
      const current = hourlyAverages.get(hourKey) || { sum: 0, count: 0 };
      hourlyAverages.set(hourKey, {
        sum: current.sum + reading.value,
        count: current.count + 1,
      });
    });

    return Array.from(hourlyAverages.entries())
      .map(([hourKey, { sum, count }]) => ({
        date: hourKey,
        average: Number((sum / count).toFixed(2)), // Round to 2 decimal places
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

      const readings = await this.getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(zoneId, sensorType, hours);

      if (readings.length < 2) {
        return {
          trendDescription: 'Insufficient readings to determine a trend.',
          absoluteChange: 'N/A',
          rateOfChange: 'N/A',
          directionOfChange: 'N/A',
          magnitudeOfChange: 'N/A',
          actionableInsight: 'Collect more data to analyze trends.',
          readingsCount: readings.length,
          unit: this.getSensorUnit(sensorType),
        };
      }

      // Sort readings by date in ascending order
      readings.sort((a, b) => a.date.getTime() - b.date.getTime());

      const oldestReading = readings[0];
      const latestReading = readings[readings.length - 1];
      const timeSpanHours = (latestReading.date.getTime() - oldestReading.date.getTime()) / (1000 * 60 * 60);

      if (timeSpanHours < hours * 0.5) {
        return {
          trendDescription: 'Insufficient time span for analysis',
          absoluteChange: 'N/A',
          rateOfChange: 'N/A',
          directionOfChange: 'N/A',
          magnitudeOfChange: 'N/A',
          actionableInsight: 'Ensure sensors are reporting data regularly.',
          readingsCount: readings.length,
          unit: this.getSensorUnit(sensorType),
        };
      }

      const absoluteChange = latestReading.value - oldestReading.value;
      const rateOfChange = absoluteChange / timeSpanHours;
      const percentageChange = (absoluteChange / oldestReading.value) * 100;

      const directionOfChange = absoluteChange > 0 ? 'Increasing' : absoluteChange < 0 ? 'Decreasing' : 'Stable';
      
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

      const actionableInsight = this.getActionableInsight(sensorType, trendDescription, absoluteChange, rateOfChange, timeSpanHours);

      return {
        trendDescription,
        absoluteChange: `${absoluteChange.toFixed(2)}${this.getSensorUnit(sensorType)}`,
        rateOfChange: `${rateOfChange.toFixed(2)}${this.getSensorUnit(sensorType)} per hour`,
        directionOfChange,
        magnitudeOfChange,
        actionableInsight,
        readingsCount: readings.length,
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
        actionableInsight: 'Check system for errors and try again.',
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
    timeSpanHours: number
  ): string {
    switch (sensorType) {
      case SensorTypeEnum.TEMPERATURE:
        return `Temperature has shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(1)}°C over ${timeSpanHours.toFixed(1)} hours (${rateOfChange.toFixed(2)}°C/hour). ${this.getTemperatureInsight(absoluteChange, rateOfChange)}`;
      case SensorTypeEnum.HUMIDITY:
        return `Humidity has shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(1)}% over ${timeSpanHours.toFixed(1)} hours (${rateOfChange.toFixed(2)}%/hour). ${this.getHumidityInsight(absoluteChange, rateOfChange)}`;
      case SensorTypeEnum.SOIL_MOISTURE:
        return `Soil moisture has shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(1)}% over ${timeSpanHours.toFixed(1)} hours (${rateOfChange.toFixed(2)}%/hour). ${this.getSoilMoistureInsight(absoluteChange, rateOfChange)}`;
      case SensorTypeEnum.LIGHT:
        return `Light levels have shown a ${trendDescription} trend, changing by ${absoluteChange.toFixed(1)} Lux over ${timeSpanHours.toFixed(1)} hours (${rateOfChange.toFixed(2)} Lux/hour). ${this.getLightInsight(absoluteChange, rateOfChange)}`;
      default:
        return `The sensor readings have shown a ${trendDescription} trend. Monitor the situation and adjust conditions if necessary.`;
    }
  }

  private getTemperatureInsight(absoluteChange: number, rateOfChange: number): string {
    if (Math.abs(absoluteChange) > 5) {
      return `This is a significant temperature change. Check environmental controls and adjust if necessary.`;
    } else if (Math.abs(rateOfChange) > 1) {
      return `Temperature is changing rapidly. Monitor closely and prepare to intervene if the trend continues.`;
    }
    return `Current temperature changes are within normal range. Continue regular monitoring.`;
  }

  private getHumidityInsight(absoluteChange: number, rateOfChange: number): string {
    if (Math.abs(absoluteChange) > 15) {
      return `This is a substantial humidity change. Check for leaks, ventilation issues, or malfunctioning humidifiers/dehumidifiers.`;
    } else if (Math.abs(rateOfChange) > 3) {
      return `Humidity is changing quickly. Investigate possible causes and adjust environmental controls if needed.`;
    }
    return `Humidity changes are moderate. Ensure plants are not showing signs of stress.`;
  }

  private getSoilMoistureInsight(absoluteChange: number, rateOfChange: number): string {
    if (absoluteChange < -10) {
      return `Soil is drying out significantly. Consider adjusting irrigation schedule or checking for drainage issues.`;
    } else if (absoluteChange > 10) {
      return `Soil moisture has increased substantially. Check for overwatering or poor drainage.`;
    } else if (Math.abs(rateOfChange) > 2) {
      return `Soil moisture is changing rapidly. Monitor closely and adjust watering practices if needed.`;
    }
    return `Soil moisture changes are within expected range. Continue regular monitoring and maintenance.`;
  }

  private getLightInsight(absoluteChange: number, rateOfChange: number): string {
    if (Math.abs(absoluteChange) > 1000) {
      return `Light levels have changed dramatically. Check for obstructions, changes in artificial lighting, or seasonal effects.`;
    } else if (Math.abs(rateOfChange) > 200) {
      return `Light levels are fluctuating rapidly. Investigate possible causes and consider adjusting light sources or shading.`;
    }
    return `Light level changes are moderate. Ensure plants are receiving appropriate light for their needs.`;
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
                issues.push(`Temperature out of range: ${latestReading.value}°C`);
              }
              break;
            case SensorTypeEnum.HUMIDITY:
              if (Math.abs(latestReading.value - speciesConditions.idealHumidity) > 10) {
                issues.push(`Humidity not ideal: ${latestReading.value}%`);
              }
              break;
            case SensorTypeEnum.SOIL_MOISTURE:
              if (Math.abs(latestReading.value - speciesConditions.soilMoisture) > 10) {
                issues.push(`Soil moisture not ideal: ${latestReading.value}%`);
              }
              break;
            case SensorTypeEnum.LIGHT: {
              const lightIssue = this.checkLightCondition(latestReading.value, speciesConditions.lightType);
              if (lightIssue) {
                issues.push(lightIssue);
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
}

export default new SensorReadingService();