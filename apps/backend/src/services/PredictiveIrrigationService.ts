import { Prisma, PrismaClient, PredictedWaterSchedule, SensorTypeEnum, Hub, RfModel, HubStatusEnum } from '@prisma/client';
import axios from 'axios';
import { RandomForestRegression as RandomForestRegressor } from 'ml-random-forest';
import SensorReadingService from './SensorReadingService';
import HubService from './HubService';
import { PredictiveIrrigation } from '@lepark/data-access';
import HistoricalRainDataService from './HistoricalRainDataService';

const prisma = new PrismaClient();

const numDays = 100;
const models = {};

interface WeatherForecast {
  forecast: string;
  rainfall: number
}
interface SensorDataGroupedByType {
  [sensorType: string]: { date: string; average: number }[];
}

// DO NOT DELETE MY COMMENTS FOR THIS SERVICE
class PredictiveIrrigationService {
  private baseUrl = 'https://api-open.data.gov.sg/v2/real-time/api';
  private models: { [hubId: number]: any } = {};
  constructor() {
    this.loadAllModels();
  }

  // -- [ PUBLIC ] --
  public async getHubHistoricalSensorsRainfallData(hub: Hub, startDate: Date, endDate: Date) {
    try {
      // Fetch historical sensor data
      const historicalSensorData = await SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(hub.id,
        startDate,
        endDate
      );
      
      // // // Generate training data using the service method
      // const historicalRainfallData = await this.getClosestRainDataPerDateBoolean(hub.lat, hub.long);

      return historicalSensorData
    } catch (error) {
      console.error(`Error training model for hub ${hub.id}:`, error);
    }
  }

    // -- [ PUBLIC ] --
    public async getHubHistoricalRainfallData(hub: Hub, startDate: Date, endDate: Date) {
      try {
        const historicalRainfallData = await this.getClosestRainDataPerDateBoolean(hub.lat, hub.long);
  
        return historicalRainfallData;
      } catch (error) {
        console.error(`Error training model for hub ${hub.id}:`, error);
      }
    }
  

  // -- [ PUBLIC ] --
  public async trainModelForHub(hub: Hub) {
    try {
      // Fetch historical sensor data
      const historicalSensorData = await SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(hub.id,
        new Date(new Date().setDate(new Date().getDate() - 100)),
        new Date(),
      );

      if (!historicalSensorData 
        || (Array.isArray(historicalSensorData) && historicalSensorData.length === 0)
        || (typeof historicalSensorData === "object" && historicalSensorData.TEMPERATURE && Array.isArray(historicalSensorData.TEMPERATURE) 
          && historicalSensorData.TEMPERATURE.length === 0)
      ) {
        throw new Error("Insufficent sensors readings to train model")
      }
  
      // Generate training data using the service method
      const historicalRainfallData = await this.getClosestRainDataPerDate(hub.lat, hub.long);
      const trainingData = this.generateTrainingData(historicalSensorData, historicalRainfallData);
  
      // Train the Random Forest model
      const model = await this.trainRandomForestModel(trainingData);
  
      // Save the trained model for the hub
      models[hub.id] = model;
  
      await this.saveModelToDatabase(hub.id, model);
    } catch (error) {
      console.error(`Error training model for hub ${hub.id}:`, error);
      throw error;
    }
  }

  // -- [ PUBLIC ] --
  public async getPredictedIrrigationForToday(hub: Hub): Promise<PredictiveIrrigation> {
    try {
      const sensorData = await this.getTodaySensorData(hub);

      if (!sensorData || (Array.isArray(sensorData) && sensorData.length === 0)) {
        throw new Error(`No sensor data found for hub ${hub.id} today.`);
      } 

      const rainfallData = await this.getTodayWeatherForecast(hub.lat, hub.long);

      const input = [
        sensorData.soilMoisture || 0,
        sensorData.temperature || 0,
        sensorData.humidity || 0,
        sensorData.light || 0,
      ]

      const model = this.models[hub.id];

      if (!model) {
        throw new Error(`No model found for hub ${hub.id} today.`);
      }

      const prediction = model.predict([input])[0];
      return ({ hubId: hub.id, rainfall: prediction, forecast: rainfallData.forecast, sensorData: sensorData });
    } catch (error) {
      console.error(`Error predicting irrigation for hub ${hub.id}:`, error);
      throw error;
    }
  }

  // -- [ PUBLIC ] --
  public async getModelForHub(hubId: string): Promise<RfModel> {
    const rfModel = await this.loadModelByHubId(hubId);
    return rfModel;
  }

  // -- [ PRIVATE ] --
  private async loadAllModels(): Promise<void> {
    try {
      const allModels = await prisma.rfModel.findMany();
      allModels.forEach((modelRecord) => {
        const { hubId, modelData } = modelRecord;
        const parsedModelData = typeof modelData === 'string' ? JSON.parse(modelData) : modelData;
        this.models[hubId] = RandomForestRegressor.load(parsedModelData);
      });
      console.log('Predictive Irrigation: Models loaded successfully.');
    } catch (error) {
      console.error('Error loading models from the database:', error);
    }
  }

  private async loadModelByHubId(hubId: string): Promise<RfModel> {
    try {
      return await prisma.rfModel.findFirst({ where: { hubId }});
    } catch (error) {
      console.error('Error loading models from the database:', error);
    }
  }

  private async seedHistoricalRainfallData(): Promise<void> {
    try {
      await HistoricalRainDataService.seedRemainingHistoricalRainfallData();
    } catch (error) {
      console.error('Error seeding remaining historical rainfall data:', error);
    }
  }

  // -- [ PRIVATE ] --
  // PREDICTION
  // Data preparation:
  // Fetch API weather forecast
  private async getTodayWeatherForecast(lat: number, lng: number): Promise<WeatherForecast> {
    try {
      const response = await axios.get(`${this.baseUrl}/twenty-four-hr-forecast`);
      const record = response.data.data.records[0];

      return ({
        forecast: record.general.forecast.text,
        rainfall: getRainfallFromForecast(record.general.forecast.text)
      });

    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  public async get4DayWeatherForecast(): Promise<WeatherForecast> {
    try {
      const response = await axios.get(`${this.baseUrl}/four-day-outlook`);
      const forecasts = response.data.data.records[0].forecasts;

      return forecasts.map((f) => {
        return { rainfall: getRainfallFromForecast(f.forecast.text), ...f }
      });

    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  // -- [ PRIVATE ] --
  // PREDICTION
  // Data preparation:
  // Fetch historical sensor data for today
  private async getTodaySensorData(hub: Hub): Promise<any> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const sensorReadings = await SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(hub.id, startOfDay, endOfDay);
      // const rainfallData = await this.getTodayWeatherForecast(hub.lat, hub.long);

      const testData = {
        soilMoisture: sensorReadings['SOIL_MOISTURE'].slice(-1)[0].average,
        temperature: sensorReadings['TEMPERATURE'].slice(-1)[0].average,
        humidity: sensorReadings['HUMIDITY'].slice(-1)[0].average,
        light: sensorReadings['LIGHT'].slice(-1)[0].average,
        // ...rainfallData
      }

      return testData;
    } catch (error) {
      console.error(`Error fetching sensor data for hub ${hub.id}:`, error);
      return [];
    }
  }

  // -- [ PRIVATE ] --
  // TRAINING
  // Data preparation:
  // Generate Training Data
  private async generateTrainingData(sensorData, historicalRainfallData) {
    const today = new Date();
    const trainingData = [];
  
    for (let i = 0; i < numDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
  
      const rainfallRecord = historicalRainfallData.find((data) => isSameDay(data.timestamp, date))
      const readings = {
        soilMoisture: getAverageSensorReading(sensorData['SOIL_MOISTURE'], date),
        temperature: getAverageSensorReading(sensorData['TEMPERATURE'], date),
        humidity: getAverageSensorReading(sensorData['HUMIDITY'], date),
        light: getAverageSensorReading(sensorData['LIGHT'], date),
        rainfall: rainfallRecord ? rainfallRecord.value : 0,
        water: 0
      };
      readings.water = getIrrigationDecision(readings, date);
      trainingData.push(readings);
    }
    return trainingData;
  };

  // -- [ PRIVATE ] --
  // TRAINING
  // Data preparation:
  // Fetch historical rainfall for given past day
  private async getClosestRainDataPerDateBoolean(lat: number, lng: number) {
    const result: any[] = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *,
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(lat)) *
              cos(radians(lng) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(lat))
            )
          ) AS distance
        FROM "HistoricalRainData"
        ORDER BY DATE("timestamp"), distance
      `
    );
  
    // Track daily rain presence using an object
    const dailyRainPresence = {};
  
    for (const record of result) {
      const date = record.timestamp.toISOString().split('T')[0]; // Get the date part
  
      // Skip further checks if we already know it rained on this date
      if (dailyRainPresence[date] === 1) continue;
  
      // If value > 0, mark as 1 (rainy day)
      dailyRainPresence[date] = record.value > 0 ? 1 : (dailyRainPresence[date] || 0);
    }
  
    return dailyRainPresence;
  };

  private async getClosestRainDataPerDate(lat: number, lng: number) {
    const parseTimestamp = (timestamp) => {
      return new Date(timestamp).getTime();
    }
    
    const calculateAUC = (data: any) => {
      let auc = 0;
      data.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));
      // Loop through the data to calculate the trapezoidal area
      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
    
        const timeDiff = (parseTimestamp(curr.timestamp) - parseTimestamp(prev.timestamp)) / 1000; // Calculate the time difference in seconds
        const area = 0.5 * (prev.value + curr.value) * timeDiff; // Calculate the area of the trapezoid
        auc += area; // Add to total AUC
      }
  
      return auc;
    }
  
    const result: any[] = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *,
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(lat)) *
              cos(radians(lng) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(lat))
            )
          ) AS distance
        FROM "HistoricalRainData"
        ORDER BY DATE("timestamp"), distance
      `
    );

    const resultsGroupedByDay = result.reduce((acc, record) => {
      const date = record.timestamp.toISOString().split('T')[0]; // Get the date part
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {});
    const dailyAUC = {};
    for (const date in resultsGroupedByDay) {
      dailyAUC[date] = calculateAUC(resultsGroupedByDay[date]);
    }
  
    return dailyAUC;
  };

  // -- [ PRIVATE ] --
  // TRAINING
  // Random Forest Training:
  private async trainRandomForestModel(trainingData) {
    const X = trainingData.map((data) => [
      data.soilMoisture,
      data.temperature,
      data.humidity,
      data.light,
      data.rainfall
    ]);
    const y = trainingData.map((data) => data.water);
    const model = new RandomForestRegressor({
      nEstimators: 100,
      treeOptions: { maxDepth: 10 },
      seed: 42,
    });
    model.train(X, y);
    return model;
  };

  // -- [ PRIVATE ] --
  // TRAINING
  // Saving RF Model to DB
  private async saveModelToDatabase(hubId, model) {
    try {
      await prisma.rfModel.upsert({
        where: { hubId: hubId },
        update: {
          modelData: model.toJSON(), // Update model data if hubId exists
        },
        create: {
          hubId: hubId,
          modelData: model.toJSON(), // Create a new record if hubId doesn't exist
        },
      });
      console.log(`Model saved to database for hub: ${hubId}`);
    } catch (error) {
      console.error(`Error saving model to database for hub ${hubId}:`, error);
    }
  };
}

export default new PredictiveIrrigationService();

// -- [ Utils ] --
function getRainfallFromForecast(textForecast: string): number {
  if (textForecast === "Light Rain" 
    || textForecast === "Moderate Rain" 
    || textForecast === "Heavy Rain" 
    || textForecast === "Passing Showers" 
    || textForecast === "Light Showers" 
    || textForecast === "Showers" 
    || textForecast === "Heavy Showers" 
    || textForecast === "Thundery Showers" 
    || textForecast === "Heavy Thundery Showers" 
    || textForecast === "Heavy Thundery Showers with Gusty Winds" 
  ) {
    return 1
  }
  return 0;
}

function getAverageSensorReading(readings: { date: string; average: number }[], date: Date): number {
  const reading = readings.find((r) => new Date(r.date).toDateString() === date.toDateString());
  return reading ? reading.average : 0;
}

const isSameDay = (timestamp, date) => {
  return (
    timestamp.getDate() === date.getDate() &&
    timestamp.getMonth() === date.getMonth() &&
    timestamp.getFullYear() === date.getFullYear()
  );
};

// TRAINING
const getIrrigationDecision = (readings, date) => {
  // Dynamic decision logic for whether to turn on the irrigation
  let water = 0;

  // 1. Determine season
  const month = date.getMonth() + 1; // getMonth() is zero-based
  let season;
  if (month >= 12 || month <= 3) {
    season =  'wet'; // Northeast Monsoon (wet season)
  } else if (month >= 6 && month <= 9) {
    season = 'dry'; // Southwest Monsoon (drier season)
  } else {
    season = 'mixed'; // Inter-monsoon period
  }

  // 2. Decision thresholds and weights, based on season
  const soilMoistureThresholdLow = season === 'dry' ? 59.2 : 59.5;
  const soilMoistureThresholdModerate = season === 'dry' ? 59.5 : 59.7;
  const temperatureThresholdHigh = 31; // High temperature, increases irrigation need
  const humidityThresholdLow = 80; // Low humidity, increases irrigation need

  // Weighted conditions for irrigation decision
  if (readings.rainfall === 1) {
    water = 0; // Sufficient rainfall, no irrigation needed
  } else if (readings.soilMoisture < soilMoistureThresholdLow) {
    water = 1; // Critical low moisture, irrigation needed
  } else if (readings.soilMoisture < soilMoistureThresholdModerate) {
    if (
      (readings.temperature > temperatureThresholdHigh) ||
      (readings.humidity < humidityThresholdLow)
    ) {
      water = 1; // High temperature or low humidity triggers irrigation
    }
  }

  return water
}

const calculateWaterData = async (sensorData, rainfallData) => {
  // Helper function to get the daily reading based on target time or fallback to first entry
  const getDailyReading = (data, date) => {
    const targetTime = `${date}T21:00:00.000Z`; // Target time at 20:00:00
    return data.find((item) => item.date === targetTime) || data[0];
  };
  const getRainfallForDate = (data, date) => {
    return data.find((item) => item.timestamp.toString().startsWith(date))?.value || 0;
  };

  // Get unique dates from sensor data to iterate over
  const dates = [...new Set(sensorData.TEMPERATURE.map((entry) => entry.date.split('T')[0]))];

  // Calculate water data for each day
  return dates.map((date: string) => {
    // Extract daily readings for each sensor type
    const tempReading = getDailyReading(sensorData.TEMPERATURE, date);
    const soilMoistureReading = getDailyReading(sensorData.SOIL_MOISTURE, date);
    const humidityReading = getDailyReading(sensorData.HUMIDITY, date);
    const lightReading = getDailyReading(sensorData.LIGHT, date);
    const rainfall = getRainfallForDate(rainfallData, date);

    // Construct the readings object for the day
    const readings = {
      temperature: tempReading?.average || 0,
      soilMoisture: soilMoistureReading?.average || 0,
      humidity: humidityReading?.average || 0,
      light: lightReading?.average || 0,
      rainfall: rainfall || 0
    };

    console.log("readings", readings)

    // Calculate the irrigation decision
    const water = getIrrigationDecision(readings, new Date(date));

    // Return object with date and water value
    return { date, value: water };
  });
};


