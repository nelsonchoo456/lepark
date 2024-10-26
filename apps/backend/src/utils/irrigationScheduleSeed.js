import { PrismaClient, Prisma } from '@prisma/client';
import { trainModelsForAllHubs } from '../models/irrigationRandomForestModel';
import axios, { AxiosResponse } from 'axios';

const prisma = new PrismaClient();

interface Station {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface Reading {
  timestamp: string;
  data: {
    stationId: string;
    value: number;
  }[];
}

interface RainfallRecord {
  stationId: string;
  stationName: string;
  lat: number;
  lng: number;
  value: number;
  timestamp: Date;
}

async function seedHistoricalRainfallData(days: number): Promise<void> {
  try {
    const sensorReadings = await prisma.sensorReading.count();
    if (sensorReadings === 0) {
      console.error('Unable to seed irrigation schedule with no sensor readings.');
      return;
    }

    const historicalRainDataCount = await prisma.historicalRainData.count();
    if (historicalRainDataCount > 0) {
      console.error('Historical rainfall data has been previously seeded. Please clear the table to re-seed the data.');
      return;
    }

    const results: RainfallRecord[] = [];
    const requests: Promise<AxiosResponse<any>>[] = [];
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
      if (response.data?.data?.readings) {
        const stations: Station[] = response.data.data.stations;
        const readings: Reading[] = response.data.data.readings;

        for (const reading of readings) {
          const timestamp = reading.timestamp;

          for (const dataPoint of reading.data) {
            const station = stations.find(s => s.id === dataPoint.stationId);
            if (station) {
              // Prepare data for bulk saving
              const rainfallRecord: RainfallRecord = {
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
    throw new Error('Failed to fetch weather forecast');
  }
}

async function trainModelsForActiveHubs(): Promise<void> {
  const hubs = await prisma.hub.findMany({ where: { hubStatus: "ACTIVE" }});
  await trainModelsForAllHubs(hubs);
}

// -- [ UTILS ] --
async function createManyHistoricalRainData(data: RainfallRecord[]): Promise<Prisma.BatchPayload> {
  return await prisma.historicalRainData.createMany({ data, skipDuplicates: true });
}

// Initial seed and model training
seedHistoricalRainfallData(100)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await trainModelsForActiveHubs();
  });
