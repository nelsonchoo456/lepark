const { PrismaClient, Prisma } = require('@prisma/client');
const { RandomForestRegression: RandomForestRegressor } = require('ml-random-forest');
const path = require('path');

const prisma = new PrismaClient();

const numDays = 100;
const SENSOR_TYPE_ENUMS = ["TEMPERATURE", "HUMIDITY", "SOIL_MOISTURE", "LIGHT", "CAMERA"]
const models = {}; // Object to store trained models for each hub

const trainModelsForAllHubs = async (hubs) => {
  for (const hub of hubs) {
    trainModelForHub(hub);
  }
};

// Function to train models for each hub
const trainModelForHub = async (hub) => {
  try {
    // Fetch historical sensor data
    const historicalSensorData = await getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(
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

    await saveModelToDatabase(hub.id, model);
  } catch (error) {
    console.error(`Error training model for hub ${hub.id}:`, error);
  }
}

const trainRandomForestModel = async (trainingData) => {
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

// Function to load saved models at startup
const loadSavedModels = async (hubId) => {
  try {
    const result = await prisma.rfModel.findFirst({
      where: { hubId: hubId },
    });

    if (result && result.modelData) {
      models[hubId] = RandomForestRegressor.load(result.modelData); // Load model from JSON
      console.log(`Model loaded from database for hub: ${hubId}`);
    } else {
      console.warn(`No model found in database for hub: ${hubId}`);
    }
  } catch (error) {
    console.error(`Error loading model from database for hub ${hubId}:`, error);
  }
};

// -- [ PRIVATE UTILS ] --
// PREDICTION
// Data preparation:
// Fetch API weather forecast
const getClosestRainDataPerDate = async (lat, lng) => {
  const result = await prisma.$queryRaw(
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
};

const getAverageSensorReading = (readings, date) => {
  const reading = readings.find((r) => new Date(r.date).toDateString() === date.toDateString());
  return reading ? reading.average : 0;
};

// -- [ PRIVATE ] --
// TRAINING
// Data preparation:
// Generate Training Data
const generateTrainingData = (sensorData, historicalRainfallData) => {
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
      rainfall: rainfallRecord ? rainfallRecord.value : 0
    };
    readings.water = getIrrigationDecision(readings, date);

    trainingData.push(readings);
  }
  console.log("end of irrigation decision")

  return trainingData;
};

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
  const temperatureThresholdHigh = 35; // High temperature, increases irrigation need
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

const getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange = async (
  hubId,
  startDate,
  endDate,
) => {
  // Adjust both start and end dates to ensure full day coverage
  const adjustedStartDate = new Date(startDate);
  adjustedStartDate.setHours(0, 0, 0, 0);
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setHours(23, 59, 59, 999);

  const sensorTypes = SENSOR_TYPE_ENUMS;
  const result = {};

  for (const sensorType of sensorTypes) {
    const readings = await prisma.sensorReading.findMany({
      where: {
        sensor: { hubId, sensorType },
        date: {
          gte: adjustedStartDate,
          lte: adjustedEndDate,
        },
      },
      include: {
        sensor: true,
      },
    });

    const hourlyAverages = new Map();

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

const isSameDay = (timestamp, date) => {
  return (
    timestamp.getDate() === date.getDate() &&
    timestamp.getMonth() === date.getMonth() &&
    timestamp.getFullYear() === date.getFullYear()
  );
};

const saveModelToDatabase = async (hubId, model) => {
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

module.exports = {
  trainModelsForAllHubs,
  loadSavedModels,

  // UTILITY FOR TESTING BELOW - may or not be able to delete later
  getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange,
  getClosestRainDataPerDate,
  isSameDay,
  getAverageSensorReading
};
