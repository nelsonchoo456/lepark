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

const trainModelForHub = async (hub) => {
  try {
    // Fetch historical sensor data
    const historicalSensorData = await getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(
      hub.id,
      new Date(new Date().setDate(new Date().getDate() - 100)),
      new Date(),
    );

    const rainfallData = await getClosestRainDataPerDate(hub.lat, hub.long);
    const trainingData = generateTrainingData(historicalSensorData, rainfallData);

    // Train the Random Forest model
    const model = await trainRandomForestModel(trainingData, rainfallData);

    // Save the trained model for the hub
    models[hub.id] = model;

    await saveModelToDatabase(hub.id, model);
  } catch (error) {
    console.error(`Error training model for hub ${hub.id}:`, error);
  }
}

const trainRandomForestModel = async (trainingData, rainfallData) => {
  const X = trainingData.map((data) => [
    data.soilMoisture,
    data.temperature,
    data.humidity,
    data.light,
  ]);

  const y = Object.values(rainfallData);
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
// Fetch (Y-data) actual historical rainfall data
const getClosestRainDataPerDate = async (lat, lng) => {
  const parseTimestamp = (timestamp) =>{
    return new Date(timestamp);
  }
  
  const calculateAUC = (data) => {
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

  const result = await prisma.$queryRaw(
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

const getAverageSensorReading = (readings, date) => {
  const reading = readings.find((r) => new Date(r.date).toDateString() === date.toDateString());
  return reading ? reading.average : 0;
};

// -- [ PRIVATE UTILS ] --
// TRAINING
// Data preparation:
// Generate Training Data
const generateTrainingData = (sensorData) => {
  const today = new Date();
  const trainingData = [];

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const readings = {
      soilMoisture: getAverageSensorReading(sensorData['SOIL_MOISTURE'], date),
      temperature: getAverageSensorReading(sensorData['TEMPERATURE'], date),
      humidity: getAverageSensorReading(sensorData['HUMIDITY'], date),
      light: getAverageSensorReading(sensorData['LIGHT'], date),
    };

    trainingData.push(readings);
  }

  return trainingData;
};

// -- [ PRIVATE UTILS ] --
// TRAINING
// Data preparation:
// Generate Training Data
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
};
