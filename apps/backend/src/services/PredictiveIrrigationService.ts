import { PrismaClient, PredictedWaterSchedule, SensorTypeEnum, Hub } from '@prisma/client';
import PredictedWaterScheduleDao from '../dao/PredictedWaterScheduleDao';
import HubDao from '../dao/HubDao';
import SpeciesDao from '../dao/SpeciesDao';
import OccurrenceDao from '../dao/OccurrenceDao';
import axios from 'axios';
import { RandomForestRegression as RandomForestRegressor } from 'ml-random-forest';
import SensorReadingService from './SensorReadingService';

const prisma = new PrismaClient();

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

class PredictiveIrrigationService {
  private models: { [hubId: number]: any } = {};
  constructor() {
    this.loadAllModels(); // Load models from database on initialization
  }

  private baseUrl = 'https://api-open.data.gov.sg/v2/real-time/api';

  private async getTodayWeatherForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
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

  // Load all models from the database
  private async loadAllModels(): Promise<void> {
    try {
      const allModels = await prisma.rfModel.findMany();
      allModels.forEach((modelRecord) => {
        const { hubId, modelData } = modelRecord;
        const parsedModelData = typeof modelData === 'string' ? JSON.parse(modelData) : modelData;
        this.models[hubId] = RandomForestRegressor.load(parsedModelData);
      });
      console.log('Models loaded successfully.');
    } catch (error) {
      console.error('Error loading models from the database:', error);
    }
  }

  // Fetch historical sensor data for today
  private async getTodaySensorData(hub: Hub) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const sensorData = SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(hub.id, startOfDay, endOfDay);

      const rainfallData = await this.getTodayWeatherForecast(hub.lat, hub.long);

      return sensorData;
    } catch (error) {
      console.error(`Error fetching sensor data for hub ${hub.id}:`, error);
      return [];
    }
  }

  // Generate input for prediction based on today's data to ensure no null
  private generatePredictionInput(sensorData: any) {
    const input = [
      sensorData.soilMoisture || 0,
      sensorData.temperature || 0,
      sensorData.humidity || 0,
      sensorData.light || 0,
      sensorData.rainfall || 0,
    ];

    return input;
  }

  // Get predicted irrigation data for today
  public async getPredictedIrrigationForToday(hub: Hub): Promise<number | null> {
    try {
      const sensorData = await this.getTodaySensorData(hub);

      console.log(sensorData);

      if (!sensorData || sensorData.length === 0) {
        console.warn(`No sensor data found for hub ${hub.id} today.`);
        return null;
      }

      const input = this.generatePredictionInput(sensorData);
      const model = this.models[hub.id];

      if (!model) {
        console.error(`No model found for hub ${hub.id}.`);
        return null;
      }

      const prediction = model.predict([input])[0];
      return prediction;
    } catch (error) {
      console.error(`Error predicting irrigation for hub ${hub.id}:`, error);
      return null;
    }
  }
}

export default new PredictiveIrrigationService();

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
