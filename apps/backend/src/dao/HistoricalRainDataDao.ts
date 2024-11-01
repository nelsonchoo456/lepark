import { PrismaClient, HistoricalRainData, Prisma, SensorTypeEnum } from '@prisma/client';
import SensorDao from './SensorDao';

const prisma = new PrismaClient();

class HistoricalRainDataDao {
  public async createHistoricalRainData(data: Prisma.HistoricalRainDataCreateInput): Promise<HistoricalRainData> {
    return prisma.historicalRainData.create({ data });
  }

  public async getHistoricalRainDataByDateAndLatLng(date: Date, lat: number, lng: number): Promise<HistoricalRainData | null> {
    const result = await prisma.$queryRaw<HistoricalRainData[]>(
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
        WHERE DATE("timestamp") = DATE(${date})
        ORDER BY distance
        LIMIT 1;
      `
    );

    return result.length > 0 ? result[0] : null;
  }

  public async getLatestHistoricalRainData(): Promise<HistoricalRainData | null> {
    return await prisma.historicalRainData.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  // Create multiple historical rainfall data records
  public async createManyHistoricalRainData(data: Prisma.HistoricalRainDataCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.historicalRainData.createMany({ data, skipDuplicates: true });
  }

  public async updateHistoricalRainData(id: string, data: Prisma.HistoricalRainDataUpdateInput): Promise<HistoricalRainData> {
    return prisma.historicalRainData.update({ where: { id }, data });
  }

  public async deleteHistoricalRainData(id: string): Promise<void> {
    await prisma.historicalRainData.delete({ where: { id } });
  }


  // public async getHistoricalRainDatasBy(sensorId: string): Promise<HistoricalRainData[]> {
  //   return prisma.historicalRainData.findMany({ where: { sensorId } });
  // }

  // public async getHistoricalRainDatasBySensorIds(sensorIds: string[]): Promise<HistoricalRainData[]> {
  //   return prisma.historicalRainData.findMany({ where: { sensorId: { in: sensorIds } } });
  // }

  // public async getHistoricalRainDatasHoursAgo(sensorId: string, hours: number): Promise<HistoricalRainData[]> {
  //   const date = new Date(Date.now() - hours * 60 * 60 * 1000);
  //   return prisma.historicalRainData.findMany({ where: { sensorId, date: { gte: date } } });
  // }


  public async getHistoricalRainDatasByDateRange(startDate: Date, endDate: Date): Promise<HistoricalRainData[]> {
    return prisma.historicalRainData.findMany({ where: { timestamp: { gte: startDate, lte: endDate } } });
  }
}

export default new HistoricalRainDataDao();