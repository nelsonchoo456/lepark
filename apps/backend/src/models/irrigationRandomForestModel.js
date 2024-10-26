const { PrismaClient, Prisma } = require('@prisma/client');
const { RandomForestRegression: RandomForestRegressor } = require('ml-random-forest');
const fs = require('fs');

const prisma = new PrismaClient();

const numDays = 100;

// Object to store trained models for each hub
const models = {};

// Function to train models for each hub
const trainModelsForAllHubs = async (hubs) => {
  for (const hub of hubs) {
    console.log(hub.id)
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

      // Optionally save the model to a file for persistence
      const modelPath = `./models/${hub.id}_random_forest.json`;
      fs.writeFileSync(modelPath, JSON.stringify(model.toJSON()), 'utf8');

      console.log(`Model trained and saved for hub: ${hub.id}`);
    } catch (error) {
      console.error(`Error training model for hub ${hub.id}:`, error);
    }
  }
};

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
const loadSavedModels = (hubIds) => {
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
const getClosestRainDataPerDate = async (lat, lng) => {
  // Raw SQL query to get one rainfall data per date, closest to the given lat and lng
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
    readings.water = getIrrigationDecision(readings);

    trainingData.push(readings);
  }

  return trainingData;
};

const getIrrigationDecision = (readings) => {
  // Dynamic decision logic for whether to turn on the irrigation
  let water = 0;

  // Decision thresholds and weights
  const soilMoistureThresholdLow = 20; // Very low moisture, critical for irrigation
  const soilMoistureThresholdModerate = 40; // Moderate moisture, may or may not need irrigation
  const temperatureThresholdHigh = 35; // High temperature, increases irrigation need
  const humidityThresholdLow = 40; // Low humidity, increases irrigation need

  // Weighted conditions for irrigation decision
  if (readings.soilMoisture < soilMoistureThresholdLow) {
    // High priority: Low soil moisture, irrigation needed
    water = 1;
  } else if (readings.soilMoisture < soilMoistureThresholdModerate) {
    if (
      readings.temperature > temperatureThresholdHigh ||
      readings.humidity < humidityThresholdLow
    ) {
      // High temperature or low humidity indicates increased water need
      water = 1;
    }
  }
  return water
}

const SENSOR_TYPE_ENUMS = [
  "TEMPERATURE", "HUMIDITY", "SOIL_MOISTURE", "LIGHT", "CAMERA"
]

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

module.exports = {
  trainModelsForAllHubs,
  loadSavedModels
};
