const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { RandomForestRegression: RandomForestRegressor } = require('ml-random-forest');
const { getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange, getClosestRainDataPerDate, isSameDay, getAverageSensorReading } = require('../models/irrigationRandomForestModel.js');
const fs = require('fs');
const path = require('path');
const randomForestDirPath = path.resolve(__dirname, '../models/random_forest');

const prisma = new PrismaClient();

const baseUrl = 'https://api-open.data.gov.sg/v2/real-time/api';

const loadModelForHub = (hubId) => {
  const modelPath = path.resolve(__dirname, `../models/random_forest/${hubId}.json`);
  console.log(modelPath)
  if (fs.existsSync(modelPath)) {
    const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    return RandomForestRegressor.load(modelData);
  } else {
    console.warn(`No saved model found for hub: ${hubId}`);
    return null;
  }
};

const getTodayWeatherForecast = async () => {
  try {
    const response = await axios.get(`${baseUrl}/twenty-four-hr-forecast`);
    const records = response.data.data.records;
    return records.map((record) => ({
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
};

// Fetch today's sensor readings and rainfall data
const getTodayData = async (hubId) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  // Fetch today's sensor readings
  const sensorData = await getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(
    hubId,
    startOfToday,
    endOfToday
  );

  // Fetch today's rainfall data
  const hubDetails = await prisma.hub.findUnique({ where: { id: hubId } });
  const rainfallData = await getClosestRainDataPerDate(hubDetails.lat, hubDetails.long);
  const rainfallToday = rainfallData.find((data) => isSameDay(data.timestamp, new Date()))?.value || 0;

  // Prepare today's data for prediction
  const todayData = {
    soilMoisture: getAverageSensorReading(sensorData['SOIL_MOISTURE'], new Date()),
    temperature: getAverageSensorReading(sensorData['TEMPERATURE'], new Date()),
    humidity: getAverageSensorReading(sensorData['HUMIDITY'], new Date()),
    light: getAverageSensorReading(sensorData['LIGHT'], new Date()),
    rainfall: rainfallToday
  };

  return todayData;
};

// Make a prediction for today
const predictForToday = async (hubId) => {
  try {
    // Load the model for the hub
    const model = loadModelForHub(hubId);
    if (!model) return;

    // Fetch today's data
    const todayData = await getTodayData(hubId);

    // Prepare the input features for the model
    const X_test = [
      todayData.soilMoisture,
      todayData.temperature,
      todayData.humidity,
      todayData.light,
      todayData.rainfall
    ];

    // Make the prediction
    const predictedWater = model.predict([X_test])[0]; // Use [X_test] as the model expects a 2D array

    // Output the prediction result
    console.log(`Predicted irrigation decision for hub ${hubId} on ${new Date().toDateString()}:`, 
      predictedWater ? 'Irrigate' : 'Do not irrigate');
  } catch (error) {
    console.error(`Error predicting for hub ${hubId}:`, error);
  }
};

// Usage example
predictForToday('a78b4d4e-90b0-41e8-866c-39c6eebcf7c3');
