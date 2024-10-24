import { PredictedWaterSchedule, SensorTypeEnum } from '@prisma/client';
import PredictedWaterScheduleDao from '../dao/PredictedWaterScheduleDao';
import HubDao from '../dao/HubDao';
import SpeciesDao from '../dao/SpeciesDao';
import OccurrenceDao from '../dao/OccurrenceDao';
import axios from 'axios';
import { RandomForestRegression as RandomForestRegressor } from 'ml-random-forest';
import SensorReadingService from './SensorReadingService';

interface WeatherReading {
  station_id: string;
  value: number;
}

interface WeatherData {
  timestamp: string;
  readings: WeatherReading[];
}

interface WeatherResponse {
  items: WeatherData[];
  api_info: { status: string };
}

interface SensorData {
  hourlyTemperature: number;
  hourlyHumidity: number;
  hourlySoilMoisture: number;
  hourlyLight: number;
  dailyTemperature: number;
  dailyHumidity: number;
  dailySoilMoisture: number;
  dailyLight: number;
  weeklyTemperature: number;
  weeklyHumidity: number;
  weeklySoilMoisture: number;
  weeklyLight: number;
}

class PredictedWaterScheduleService {
  private baseUrl = 'https://api.data.gov.sg/v1/environment';

  private async getWeatherData(endpoint: string, date: string): Promise<WeatherResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint} data:`, error);
      throw new Error(`Failed to fetch ${endpoint} data`);
    }
  }

  private async getWeatherForecast(lat: number, long: number, days: number): Promise<{ date: Date; rainfall: number; temperature: number }[]> {
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      
      const [rainfallData, temperatureData] = await Promise.all([
        this.getWeatherData('rainfall', dateString),
        this.getWeatherData('air-temperature', dateString)
      ]);

      // Calculate daily average rainfall and temperature
      const dailyRainfall = rainfallData.items.reduce((sum, item) => {
        const itemAvg = item.readings.reduce((s, r) => s + r.value, 0) / item.readings.length;
        return sum + itemAvg;
      }, 0) / rainfallData.items.length;

      const dailyTemperature = temperatureData.items.reduce((sum, item) => {
        const itemAvg = item.readings.reduce((s, r) => s + r.value, 0) / item.readings.length;
        return sum + itemAvg;
      }, 0) / temperatureData.items.length;

      forecast.push({
        date,
        rainfall: dailyRainfall,
        temperature: dailyTemperature
      });
    }

    return forecast;
  }

  private async getHistoricalData(hubId: string, days: number): Promise<any[]> {
    const [
      hourlyTemperatureData,
      hourlyHumidityData,
      hourlySoilMoistureData,
      hourlyLightData,
      dailyTemperatureData,
      dailyHumidityData,
      dailySoilMoistureData,
      dailyLightData,
      weeklyTemperatureData,
      weeklyHumidityData,
      weeklySoilMoistureData,
      weeklyLightData
    ] = await Promise.all([
      SensorReadingService.getHourlyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.TEMPERATURE, days),
      SensorReadingService.getHourlyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.HUMIDITY, days),
      SensorReadingService.getHourlyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.SOIL_MOISTURE, days),
      SensorReadingService.getHourlyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.LIGHT, days),
      SensorReadingService.getDailyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.TEMPERATURE, days),
      SensorReadingService.getDailyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.HUMIDITY, days),
      SensorReadingService.getDailyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.SOIL_MOISTURE, days),
      SensorReadingService.getDailyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.LIGHT, days),
      SensorReadingService.getWeeklyAverageSensorReadingsForPastWeeks(hubId, SensorTypeEnum.TEMPERATURE, Math.ceil(days/7)),
      SensorReadingService.getWeeklyAverageSensorReadingsForPastWeeks(hubId, SensorTypeEnum.HUMIDITY, Math.ceil(days/7)),
      SensorReadingService.getWeeklyAverageSensorReadingsForPastWeeks(hubId, SensorTypeEnum.SOIL_MOISTURE, Math.ceil(days/7)),
      SensorReadingService.getWeeklyAverageSensorReadingsForPastWeeks(hubId, SensorTypeEnum.LIGHT, Math.ceil(days/7)),
    ]);

    return hourlyTemperatureData.map((temp, index) => {
      const date = new Date(temp.date);
      const dailyIndex = dailyTemperatureData.findIndex(d => new Date(d.date).toDateString() === date.toDateString());
      const weeklyIndex = weeklyTemperatureData.findIndex(w => date >= new Date(w.date) && date < new Date(new Date(w.date).getTime() + 7 * 24 * 60 * 60 * 1000));

      return {
        date: temp.date,
        hourlyTemperature: temp.average,
        hourlyHumidity: hourlyHumidityData[index]?.average || 0,
        hourlySoilMoisture: hourlySoilMoistureData[index]?.average || 0,
        hourlyLight: hourlyLightData[index]?.average || 0,
        dailyTemperature: dailyTemperatureData[dailyIndex]?.average || 0,
        dailyHumidity: dailyHumidityData[dailyIndex]?.average || 0,
        dailySoilMoisture: dailySoilMoistureData[dailyIndex]?.average || 0,
        dailyLight: dailyLightData[dailyIndex]?.average || 0,
        weeklyTemperature: weeklyTemperatureData[weeklyIndex]?.average || 0,
        weeklyHumidity: weeklyHumidityData[weeklyIndex]?.average || 0,
        weeklySoilMoisture: weeklySoilMoistureData[weeklyIndex]?.average || 0,
        weeklyLight: weeklyLightData[weeklyIndex]?.average || 0,
      };
    });
  }

  private async trainRandomForestModel(trainingData: any[]): Promise<RandomForestRegressor> {
    const X = trainingData.map(data => [
      data.hourlyTemperature,
      data.hourlyHumidity,
      data.hourlySoilMoisture,
      data.hourlyLight,
      data.dailyTemperature,
      data.dailyHumidity,
      data.dailySoilMoisture,
      data.dailyLight,
      data.weeklyTemperature,
      data.weeklyHumidity,
      data.weeklySoilMoisture,
      data.weeklyLight,
      data.rainfall,
      data.temperature,
      data.idealSoilMoisture,
    ]);
    const y = trainingData.map(data => data.waterAmount);

    const model = new RandomForestRegressor({
      nEstimators: 100,
      treeOptions: { maxDepth: 10 },
      seed: 42,
    });
    model.train(X, y);
    return model;
  }

  private generateTrainingData(sensorData: SensorData[], weatherData: { date: Date; rainfall: number; temperature: number }[], idealSoilMoisture: number): any[] {
    return sensorData.map((sensor, index) => ({
      ...sensor,
      rainfall: weatherData[index].rainfall,
      temperature: weatherData[index].temperature,
      idealSoilMoisture,
      waterAmount: this.calculateWaterAmount(sensor.hourlySoilMoisture, idealSoilMoisture, weatherData[index].rainfall),
    }));
  }

  private calculateWaterAmount(currentSoilMoisture: number, idealSoilMoisture: number, rainfall: number): number {
    const moistureDeficit = Math.max(0, idealSoilMoisture - currentSoilMoisture);
    return Math.max(0, moistureDeficit - rainfall);
  }

  private async getAverageSensorData(hubId: string, hours: number): Promise<SensorData> {
    const [hourlyAverages, dailyAverages, weeklyAverages] = await Promise.all([
      SensorReadingService.getAverageSensorReadingsForHubIdAcrossAllSensorTypesForHoursAgo(hubId, hours),
      SensorReadingService.getDailyAverageSensorReadingsForPastDays(hubId, SensorTypeEnum.TEMPERATURE, 1),
      SensorReadingService.getWeeklyAverageSensorReadingsForPastWeeks(hubId, SensorTypeEnum.TEMPERATURE, 1),
    ]);
    
    return {
      hourlyTemperature: hourlyAverages[SensorTypeEnum.TEMPERATURE] || 0,
      hourlyHumidity: hourlyAverages[SensorTypeEnum.HUMIDITY] || 0,
      hourlySoilMoisture: hourlyAverages[SensorTypeEnum.SOIL_MOISTURE] || 0,
      hourlyLight: hourlyAverages[SensorTypeEnum.LIGHT] || 0,
      dailyTemperature: dailyAverages[0]?.average || 0,
      dailyHumidity: dailyAverages[0]?.average || 0,
      dailySoilMoisture: dailyAverages[0]?.average || 0,
      dailyLight: dailyAverages[0]?.average || 0,
      weeklyTemperature: weeklyAverages[0]?.average || 0,
      weeklyHumidity: weeklyAverages[0]?.average || 0,
      weeklySoilMoisture: weeklyAverages[0]?.average || 0,
      weeklyLight: weeklyAverages[0]?.average || 0,
    };
  }

  public async generatePredictedWaterSchedule(hubId: string, days = 7): Promise<PredictedWaterSchedule[]> {
    const hub = await HubDao.getHubById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }

    const occurrences = await OccurrenceDao.getAllOccurrencesByZoneId(hub.zoneId);
    const species = await Promise.all(occurrences.map(occurrence => SpeciesDao.getSpeciesById(occurrence.speciesId)));
    const avgIdealSoilMoisture = species.reduce((sum, s) => sum + s.soilMoisture, 0) / species.length;

    // Fetch weather forecast data
    const forecastData = await this.getWeatherForecast(hub.lat, hub.long, days);

    // Get historical sensor data for the past 30 days
    const historicalData = await this.getHistoricalData(hubId, 30);

    // Generate training data
    const trainingData = this.generateTrainingData(historicalData, forecastData, avgIdealSoilMoisture);

    const model = await this.trainRandomForestModel(trainingData);

    const schedules: PredictedWaterSchedule[] = [];

    for (const forecast of forecastData) {
      const { date, rainfall, temperature } = forecast;
      const latestReadings = await this.getAverageSensorData(hubId, 1);

      const predictedWaterAmount = model.predict([[
        latestReadings.hourlyTemperature,
        latestReadings.hourlyHumidity,
        latestReadings.hourlySoilMoisture,
        latestReadings.hourlyLight,
        latestReadings.dailyTemperature,
        latestReadings.dailyHumidity,
        latestReadings.dailySoilMoisture,
        latestReadings.dailyLight,
        latestReadings.weeklyTemperature,
        latestReadings.weeklyHumidity,
        latestReadings.weeklySoilMoisture,
        latestReadings.weeklyLight,
        rainfall,
        temperature,
        avgIdealSoilMoisture,
      ]]);

      const schedule = await PredictedWaterScheduleDao.createPredictedWaterSchedule({
        hub: { connect: { id: hubId } },
        scheduledDate: date,
        waterAmount: predictedWaterAmount[0],
        confidence: 0.7, // This could be improved based on model metrics
      });

      schedules.push(schedule);
    }

    return schedules;
  }

  public async getPredictedWaterSchedulesByHubId(hubId: string): Promise<PredictedWaterSchedule[]> {
    return PredictedWaterScheduleDao.getPredictedWaterSchedulesByHubId(hubId);
  }

  public async getPredictedWaterSchedulesByDateRange(startDate: Date, endDate: Date): Promise<PredictedWaterSchedule[]> {
    return PredictedWaterScheduleDao.getPredictedWaterSchedulesByDateRange(startDate, endDate);
  }

  public async updatePredictedWaterSchedule(id: string, data: Partial<PredictedWaterSchedule>): Promise<PredictedWaterSchedule> {
    return PredictedWaterScheduleDao.updatePredictedWaterSchedule(id, data);
  }

  public async deletePredictedWaterSchedule(id: string): Promise<void> {
    await PredictedWaterScheduleDao.deletePredictedWaterSchedule(id);
  }
}

export default new PredictedWaterScheduleService();
