const { PrismaClient, Prisma } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function seedHistoricalRainfallData(days) {
  try {
    // const sensorReadings = await prisma.sensorReading.count();
    // if (sensorReadings === 0) {
    //   console.error('Unable to seed irrigation schedule with no sensor readings.');
    //   return;
    // }
    // const historicalRainDataCount = await prisma.historicalRainData.count();
    // if (historicalRainDataCount > 0) {
    //   console.log(historicalRainDataCount);
    //   console.error('Historical rainfall data has been previously seeded. Please clear the table to re-seed the data.');
    //   return;
    // }

    const results = [];
    const requests = [];
    const today = new Date();

    // Prepare requests for the specified number of days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().substring(0, 10);
      const request = axios.get(
        `https://api-open.data.gov.sg/v2/real-time/api/rainfall?date=${dateString}`
      );
      requests.push(request);
    }
    const responses = await Promise.all(requests);

    // Process the responses
    for (const response of responses) {
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

    console.log(results)

    // Bulk save the rainfall data using createMany
    // if (results.length > 0) {
    //   await createManyHistoricalRainData(results);
    // }
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Failed to fetch weather forecast');
  }
  
  return [];
}

async function test() {
  const data =  await prisma.historicalRainData.findMany({ where: { stationName: "Tuas Road" }});
  console.log(data);
}

async function createManyHistoricalRainData(data) {
  return await prisma.historicalRainData.createMany({ data, skipDuplicates: true });
}

test();
// seedHistoricalRainfallData(1);

