const { PrismaClient, Prisma } = require('@prisma/client');
const { trainModelsForAllHubs } = require('../models/irrigationRandomForestModel.js');
const axios = require('axios');

const prisma = new PrismaClient();

// -- [ FUNCTIONS: Seeding Rainfall Data ] --
async function seedHistoricalRainfallData(days) {
  try {
    const historicalRainDataCount = await prisma.historicalRainData.count();
    if (historicalRainDataCount > 0) {
      console.error('Historical rainfall data has been previously seeded. Please clear the table to re-seed the data.');
      return;
    }

    const results = [];
    const requests = [];
    const today = new Date();

    // Prepare requests for the specified number of days
    for (let i = 1; i < days + 1; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().substring(0, 10);
      console.log("dateString", dateString)
      const request = axios.get(
        `https://api-open.data.gov.sg/v2/real-time/api/rainfall?date=${dateString}`
      );
      requests.push(request);
    }
    const responses = await Promise.all(
      requests.map(request =>
        request.catch(error => {
          return null; // Return null to handle it later if needed
        })
      )
    );
    console.log("responses", responses.length)
    // console.log("responses[0]", responses[0])    
    // console.log("responses[50]", responses[50])    
    const validResponses = await responses.filter(response => response !== null);
    console.log("validResponses", validResponses.length)
    // Process the responses
    for (const response of validResponses) {
      if (response.data && response.data.data && response.data.data.readings) {
        const stations = response.data.data.stations;
        const readings = response.data.data.readings;

        for (const reading of readings) {
          const timestamp = reading.timestamp;

          for (const dataPoint of reading.data) {
            const station = stations.find(s => s.id === dataPoint.stationId);
            if (station) {
              // Prepare data for bulk saving
              const rainfallRecord = {
                stationId: station.id,
                stationName: station.name,
                lat: station.location.latitude,
                lng: station.location.longitude,
                value: dataPoint.value,
                timestamp: new Date(timestamp),
              };

              results.push(rainfallRecord);
            }
          }
        }
      }
    }

    // Bulk save the rainfall data using createMany
    if (results.length > 0) {
      await createManyHistoricalRainData(results);
    }
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
  }
  
  return [];
}

// -- [ FUNCTIONS: Training Model ] --
async function trainModelsForActiveHubs() {
  const hubs = await prisma.hub.findMany({ where: { hubStatus: "ACTIVE" }});
  await trainModelsForAllHubs(hubs);
}

// -- [ UTILS ] --
async function createManyHistoricalRainData(data) {
  return await prisma.historicalRainData.createMany({ data, skipDuplicates: true });
}

module.exports = {
  seedHistoricalRainfallData
};