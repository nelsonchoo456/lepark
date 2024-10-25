import { PredictedWaterSchedule, SensorTypeEnum } from '@prisma/client';
import PredictedWaterScheduleDao from '../dao/PredictedWaterScheduleDao';
import HubDao from '../dao/HubDao';
import SpeciesDao from '../dao/SpeciesDao';
import OccurrenceDao from '../dao/OccurrenceDao';
import axios from 'axios';
import { RandomForestRegression as RandomForestRegressor } from 'ml-random-forest';
import SensorReadingService from './SensorReadingService';

interface WeatherForecast {
  date: string;
  temperature: {
    low: number;
    high: number;
  };
  relativeHumidity: {
    low: number;
    high: number;
  };
  forecast: string;
  wind: {
    speed: {
      low: number;
      high: number;
    };
    direction: string;
  };
}

interface SensorDataGroupedByType {
  [sensorType: string]: { date: string; average: number }[];
}

class PredictedWaterScheduleService {
  private baseUrl = 'https://api-open.data.gov.sg/v2/real-time/api';

  private async getTodayWeatherForecast(): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/twenty-four-hr-forecast`);
      const records = response.data.data.records;
      return records.map((record: any) => ({
        date: record.date,
        temperature: record.general.temperature,
        relativeHumidity: record.general.relativeHumidity,
        forecast: record.general.forecast.text,
        wind: record.general.wind,
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  private async getAverageHourlySensorDataData(hubId: string, startDate: Date, endDate: Date): Promise<SensorDataGroupedByType> {
    return SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(hubId, startDate, endDate);
  }

  // TODO
  private async trainRandomForestModel(trainingData: any[]): Promise<RandomForestRegressor> {
    const X = trainingData.map((data) => [
      data.soilMoisture,
      data.temperature,
      data.humidity,
      data.light,
      // data.temperatureLow,
      // data.temperatureHigh,
      // data.humidityLow,
      // data.humidityHigh,
      // getRainFactorFromForecast(data.forecast),
      // data.windSpeedLow,
      // data.windSpeedHigh,
      // getWindDirectionFactor(data.windDirection),
    ]);
    const y = trainingData.map((data) => data.waterAmount);
    const model = new RandomForestRegressor({
      nEstimators: 100,
      treeOptions: { maxDepth: 10 },
      seed: 42,
    });
    model.train(X, y);
    return model;
  }

  // TODO
  private generateTrainingData(sensorData: SensorDataGroupedByType, weatherData: WeatherForecast[]): any[] {
    const trainingData = [];

    for (const weather of weatherData) {
      const date = new Date(weather.date);
      const sensorReadings = {
        soilMoisture: getAverageSensorReading(sensorData[SensorTypeEnum.SOIL_MOISTURE], date),
        temperature: getAverageSensorReading(sensorData[SensorTypeEnum.TEMPERATURE], date),
        humidity: getAverageSensorReading(sensorData[SensorTypeEnum.HUMIDITY], date),
        light: getAverageSensorReading(sensorData[SensorTypeEnum.LIGHT], date),
      };

      trainingData.push({
        ...sensorReadings,
        waterAmount: 1,
        // waterAmount: this.calculateWaterAmount(sensorReadings, weather),
      });
    }

    return trainingData;
  }

  // TODO
  private predictWaterSchedule(
    model: RandomForestRegressor,
    weather: WeatherForecast,
    sensorData: SensorDataGroupedByType,
  ): { waterAmount: number } {
    const date = new Date(weather.date);
    const input = [
      getAverageSensorReading(sensorData[SensorTypeEnum.SOIL_MOISTURE], date),
      getAverageSensorReading(sensorData[SensorTypeEnum.TEMPERATURE], date),
      getAverageSensorReading(sensorData[SensorTypeEnum.HUMIDITY], date),
      getAverageSensorReading(sensorData[SensorTypeEnum.LIGHT], date),
      weather.temperature.low,
      weather.temperature.high,
      weather.relativeHumidity.low,
      weather.relativeHumidity.high,
      getRainFactorFromForecast(weather.forecast),
      weather.wind.speed.low,
      weather.wind.speed.high,
      getWindDirectionFactor(weather.wind.direction),
    ];

    const waterAmount = model.predict([input])[0];

    return { waterAmount };
  }

  // TODO
  public async generatePredictedWaterSchedule(hubId: string, days = 7): Promise<PredictedWaterSchedule[]> {
    // const historicalWeatherData = await this.getHistoricalWeatherData(100); // put historical rainfall data here
    const historicalSensorData = await this.getAverageHourlySensorDataData(
      hubId,
      new Date(new Date().setDate(new Date().getDate() - 100)),
      new Date(),
    );
    const trainingData = this.generateTrainingData(historicalSensorData, []);
    const model = await this.trainRandomForestModel(trainingData);

    const predictions: PredictedWaterSchedule[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const weatherForecast = await this.getTodayWeatherForecast();
      const forecastForDate = weatherForecast.find((f) => new Date(f.date).toDateString() === date.toDateString());

      if (forecastForDate) {
        const prediction = this.predictWaterSchedule(model, forecastForDate, historicalSensorData);
        predictions.push({
          id: '', // This will be generated by the database
          hubId,
          scheduledDate: date,
          waterAmount: prediction.waterAmount,
          confidence: 0.8, // You might want to calculate this based on the model's performance
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Save predictions to database
    for (const prediction of predictions) {
      await PredictedWaterScheduleDao.createPredictedWaterSchedule({
        ...prediction,
        hub: { connect: { id: hubId } },
      });
    }

    return predictions;
  }

  // private calculateWaterAmount(sensorReadings: any, weather: WeatherForecast): number {
  //   // Implement a simple calculation for water amount
  //   // This is a placeholder and should be replaced with a more sophisticated algorithm
  //   // const baseAmount = 10; // Base amount in liters
  //   // const soilMoistureFactor = 1 - sensorReadings.soilMoisture / 100;
  //   // const temperatureFactor = (weather.temperature.high - 20) / 10; // Assume 20°C is neutral
  //   // const rainFactor = 1 - getRainFactorFromForecast(weather.forecast);

  //   // return baseAmount * soilMoistureFactor * (1 + temperatureFactor) * rainFactor;
  //   return 0;
  // }

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

// -- [ Utils ] --
function getRainFactorFromForecast(forecast: string): number {
  const rainFactors: { [key: string]: number } = {
    Fair: 0,
    'Fair (Day)': 0,
    'Fair (Night)': 0,
    'Fair and Warm': 0,
    'Partly Cloudy': 0.1,
    'Partly Cloudy (Day)': 0.1,
    'Partly Cloudy (Night)': 0.1,
    Cloudy: 0.2,
    Hazy: 0,
    'Slightly Hazy': 0,
    Windy: 0,
    Mist: 0.1,
    Fog: 0.1,
    'Light Rain': 0.3,
    'Moderate Rain': 0.5,
    'Heavy Rain': 0.8,
    'Passing Showers': 0.2,
    'Light Showers': 0.3,
    Showers: 0.4,
    'Heavy Showers': 0.6,
    'Thundery Showers': 0.7,
    'Heavy Thundery Showers': 0.9,
    'Heavy Thundery Showers with Gusty Winds': 1,
  };
  return rainFactors[forecast] || 0;
}

function getAverageSensorReading(readings: { date: string; average: number }[], date: Date): number {
  const reading = readings.find((r) => new Date(r.date).toDateString() === date.toDateString());
  return reading ? reading.average : 0;
}

function getWindDirectionFactor(direction: string): number {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions.indexOf(direction) / (directions.length - 1);
}
