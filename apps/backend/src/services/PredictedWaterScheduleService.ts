import { PredictedWaterSchedule, SensorTypeEnum } from '@prisma/client';
import PredictedWaterScheduleDao from '../dao/PredictedWaterScheduleDao';
import HubDao from '../dao/HubDao';
import SensorDao from '../dao/SensorDao';
import SpeciesDao from '../dao/SpeciesDao';
import OccurrenceDao from '../dao/OccurrenceDao';
import axios from 'axios';
import { RandomForestRegression as RandomForestRegressor } from 'ml-random-forest';
import SensorReadingService from './SensorReadingService';

interface WeatherForecast {
  date: Date;
  precipitation: number; // in mm
  temperature: number; // in Celsius
}

interface SensorData {
  light: number;
  temperature: number;
  soilMoisture: number;
  humidity: number;
}

class PredictedWaterScheduleService {
  private apiKey = process.env.WEATHER_API_KEY;
  private baseUrl = 'https://api.weatherapi.com/v1'; // example API

  private async getWeatherForecast(lat: number, long: number, days: number): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast.json`, {
        params: {
          key: this.apiKey,
          q: `${lat},${long}`,
          days: days,
        }
      });

      // Process and return the data in the format we need
      return response.data.forecast.forecastday.map(day => ({
        date: new Date(day.date),
        precipitation: day.day.totalprecip_mm,
        temperature: day.day.avgtemp_c,
      }));
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }



  private async trainRandomForestModel(trainingData: any[]): Promise<RandomForestRegressor> {
    const X = trainingData.map(data => [
      data.light,
      data.temperature,
      data.soilMoisture,
      data.humidity,
      data.precipitation,
      data.weatherTemperature,
      data.idealSoilMoisture,
    ]);
    const y = trainingData.map(data => data.waterAmount);

    const model = new RandomForestRegressor({
      nEstimators: 100,
      treeOptions: { maxDepth: 10 },
      seed: 42, // for reproducibility
    });
    model.train(X, y);
    return model;
  }

  private generateTrainingData(sensorData: SensorData[], weatherData: WeatherForecast[], idealSoilMoisture: number): any[] {
    return sensorData.map((sensor, index) => ({
      ...sensor,
      precipitation: weatherData[index].precipitation,
      weatherTemperature: weatherData[index].temperature,
      idealSoilMoisture,
      waterAmount: this.calculateWaterAmount(sensor.soilMoisture, idealSoilMoisture, weatherData[index].precipitation),
    }));
  }

  private calculateWaterAmount(currentSoilMoisture: number, idealSoilMoisture: number, precipitation: number): number {
    const moistureDeficit = Math.max(0, idealSoilMoisture - currentSoilMoisture);
    return Math.max(0, moistureDeficit - precipitation);
  }

  private async getAverageSensorData(hubId: string, hours: number): Promise<SensorData> {
    const averages = await SensorReadingService.getAverageSensorReadingsForHubIdAcrossAllSensorTypesForHoursAgo(hubId, hours);
    
    return {
      light: averages[SensorTypeEnum.LIGHT] || 0,
      temperature: averages[SensorTypeEnum.TEMPERATURE] || 0,
      soilMoisture: averages[SensorTypeEnum.SOIL_MOISTURE] || 0,
      humidity: averages[SensorTypeEnum.HUMIDITY] || 0,
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

    // Get average sensor data for the past 24 hours
    const averageSensorData = await this.getAverageSensorData(hubId, 24);

    // Generate synthetic training data
    const trainingData = this.generateTrainingData(
      Array(days).fill(averageSensorData),
      forecastData,
      avgIdealSoilMoisture
    );

    const model = await this.trainRandomForestModel(trainingData);

    const schedules: PredictedWaterSchedule[] = [];

    for (const forecast of forecastData) {
      const { date, precipitation, temperature } = forecast;
      
      const predictedWaterAmount = model.predict([[
        averageSensorData.light,
        averageSensorData.temperature,
        averageSensorData.soilMoisture,
        averageSensorData.humidity,
        precipitation,
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
