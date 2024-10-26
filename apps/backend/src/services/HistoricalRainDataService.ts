import { HistoricalRainData, Prisma } from '@prisma/client';
import { HistoricalRainSchema } from "../schemas/historicalRainDataSchema";
import HistoricalRainDataDao from '../dao/HistoricalRainDataDao';
import axios from 'axios';

class HistoricalRainDataService {
  public async createHistoricalRainData(data: Prisma.HistoricalRainDataCreateInput): Promise<HistoricalRainData> {
    return await HistoricalRainDataDao.createHistoricalRainData(data);
  }

  public async getHistoricalRainDataByDateAndLatLng(date: Date, lat: number, lng: number): Promise<HistoricalRainData> {
    return await HistoricalRainDataDao.getHistoricalRainDataByDateAndLatLng(date, lat, lng);
  }

  // Purposely skipped the Zod schema verification bc need to call these methods many, many times
  public async createManyHistoricalRainData(data: Prisma.HistoricalRainDataCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return await HistoricalRainDataDao.createManyHistoricalRainData(data);
  }

  // -- [Seed Data Utils] --
  public async seedHistoricalRainfallData(days: number): Promise<any[]> {
    try {
      const results: Prisma.HistoricalRainDataCreateManyInput[] = [];
      const requests = [];
      const today = new Date();

      // Prepare requests for the specified number of days
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const request = axios.get(
          `https://api.data.gov.sg/v1/environment/rainfall?date=${dateString}`
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
                const rainfallRecord: Prisma.HistoricalRainDataCreateManyInput = {
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
        await this.createManyHistoricalRainData(results);
      }
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
    
    return [];
  }
}

export default new HistoricalRainDataService();