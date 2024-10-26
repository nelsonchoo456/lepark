import { PrismaClient, HistoricalRainData, Hub, Prisma, SensorTypeEnum } from '@prisma/client';
import { RandomForestRegression as RandomForestRegressor } from 'ml-random-forest';
import fs from 'fs';
import SensorReadingService from '../services/SensorReadingService';

interface SensorDataGroupedByType {
  [sensorType: string]: { date: string; average: number }[];
}

const prisma = new PrismaClient();

const numDays = 100;

// Object to store trained models for each hub
const models: { [key: string]: RandomForestRegressor } = {};

// Function to train models for each hub
export const trainModelsForAllHubs = async (hubs: Hub[]) => {
  for (const hub of hubs) {
    try {
      // Fetch historical sensor data
      const historicalSensorData = await SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(
        hub.id,
        new Date(new Date().setDate(new Date().getDate() - 100)),
        new Date(),
      );

      // Generate training data using the service method
      const historicalRainfallData = await getClosestRainDataPerDate(hub.lat, hub.long);
      const trainingData = generateTrainingData(historicalSensorData, historicalRainfallData);

      // Train the Random Forest model
      const model = await trainRandomForestModel(trainingData);

      // Save the trained model for the hub
      models[hub.id] = model;

      // Optionally save the model to a file for persistence
      const modelPath = `./models/${hub.id}_random_forest.json`;
      fs.writeFileSync(modelPath, JSON.stringify(model.toJSON()), 'utf8');

      console.log(`Model trained and saved for hub: ${hub.id}`);
    } catch (error) {
      console.error(`Error training model for hub ${hub.id}:`, error);
    }
  }
};

const trainRandomForestModel = async (trainingData: any[]): Promise<RandomForestRegressor>  => {
  const X = trainingData.map((data) => [
    data.soilMoisture,
    data.temperature,
    data.humidity,
    data.light,
    data.rainfall
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

// Function to make a prediction for a specific hub
// export const predictForHub = async (hubId: string, forecast: WeatherForecast, sensorData: SensorDataGroupedByType) => {
//   try {
//     const model = models[hubId];
//     if (!model) {
//       throw new Error(`No model found for hub: ${hubId}`);
//     }

//     // Use the predictWaterSchedule method to generate a prediction
//     const prediction = PredictedWaterScheduleService.predictWaterSchedule(model, forecast, sensorData);

//     return prediction;
//   } catch (error) {
//     console.error(`Error predicting for hub ${hubId}:`, error);
//     throw error;
//   }
// };

// Function to load saved models at startup
export const loadSavedModels = (hubIds: string[]) => {
  for (const hubId of hubIds) {
    const modelPath = `./models/${hubId}_random_forest.json`;
    if (fs.existsSync(modelPath)) {
      const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      models[hubId] = RandomForestRegressor.load(modelData);
      console.log(`Model loaded for hub: ${hubId}`);
    } else {
      console.warn(`No saved model found for hub: ${hubId}`);
    }
  }
};


// -- [ UTILS BELOW ] --

const getClosestRainDataPerDate= async (lat: number, lng: number): Promise<HistoricalRainData[]> =>{
  // Raw SQL query to get one rainfall data per date, closest to the given lat and lng
  const result = await prisma.$queryRaw<HistoricalRainData[]>(
    Prisma.sql`
      SELECT DISTINCT ON (DATE("timestamp")) *,
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

  return result;
}

function getAverageSensorReading(readings: { date: string; average: number }[], date: Date): number {
  const reading = readings.find((r) => new Date(r.date).toDateString() === date.toDateString());
  return reading ? reading.average : 0;
}

const generateTrainingData = (sensorData: SensorDataGroupedByType, historicalRainData: HistoricalRainData[]): any[] => {
  const today = new Date();
  const trainingData = [];

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().substring(0, 10);

    const readings = {
      soilMoisture: getAverageSensorReading(sensorData[SensorTypeEnum.SOIL_MOISTURE], date),
      temperature: getAverageSensorReading(sensorData[SensorTypeEnum.TEMPERATURE], date),
      humidity: getAverageSensorReading(sensorData[SensorTypeEnum.HUMIDITY], date),
      light: getAverageSensorReading(sensorData[SensorTypeEnum.LIGHT], date),
      rainfall: historicalRainData.find((data) => data.timestamp === date).value
    };

    // do logic for water or not here

    trainingData.push(readings);
  }

  return trainingData;
}