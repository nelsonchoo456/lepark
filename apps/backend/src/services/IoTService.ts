import { LightTypeEnum, SensorTypeEnum } from '@prisma/client';
import SpeciesService from './SpeciesService';
import OccurrenceService, { OccurrenceWithDetails } from './OccurrenceService';
import SensorReadingService from './SensorReadingService';

class IoTService {
  public async getUnhealthyOccurrences(zoneId: number): Promise<{ occurrenceId: string; speciesName: string; issues: string[] }[]> {
    const occurrences: OccurrenceWithDetails[] = await OccurrenceService.getAllOccurrenceByZoneId(zoneId);
    console.log('Occurrences:', occurrences);
    const unhealthyOccurrences = [];

    for (const occurrence of occurrences) {
      const speciesConditions = await SpeciesService.getSpeciesIdealConditions(occurrence.speciesId);
      const issues = [];

      // Check temperature
      const latestTemperature = await SensorReadingService.getLatestSensorReadingByZoneIdAndSensorType(zoneId, SensorTypeEnum.TEMPERATURE);
      if (latestTemperature && (latestTemperature.value < speciesConditions.minTemp || latestTemperature.value > speciesConditions.maxTemp)) {
        issues.push(`Temperature out of range: ${latestTemperature.value}°C`);
      }

      // Check humidity
      const latestHumidity = await SensorReadingService.getLatestSensorReadingByZoneIdAndSensorType(zoneId, SensorTypeEnum.HUMIDITY);
      if (latestHumidity && Math.abs(latestHumidity.value - speciesConditions.idealHumidity) > 10) {
        issues.push(`Humidity not ideal: ${latestHumidity.value}%`);
      }

      // Check soil moisture (as an approximation for water requirement)
      const latestSoilMoisture = await SensorReadingService.getLatestSensorReadingByZoneIdAndSensorType(zoneId, SensorTypeEnum.SOIL_MOISTURE);
      if (latestSoilMoisture && Math.abs(latestSoilMoisture.value - speciesConditions.waterRequirement) > 10) {
        issues.push(`Soil moisture not ideal: ${latestSoilMoisture.value}%`);
      }

      // Check light (this is more complex and might require additional logic)
      const latestLight = await SensorReadingService.getLatestSensorReadingByZoneIdAndSensorType(zoneId, SensorTypeEnum.LIGHT);
      if (latestLight) {
        const lightIssue = this.checkLightCondition(latestLight.value, speciesConditions.lightType);
        if (lightIssue) {
          issues.push(lightIssue);
        }
      }

      if (issues.length > 0) {
        unhealthyOccurrences.push({
          occurrenceId: occurrence.id,
          speciesName: occurrence.species.speciesName, // Now you can access species directly
          issues,
        });
      }
    }

    return unhealthyOccurrences;
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
}

export default new IoTService();
