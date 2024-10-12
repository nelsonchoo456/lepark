import { PrismaClient, SensorReading, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class SensorReadingDao {
  public async createSensorReading(data: Prisma.SensorReadingCreateInput): Promise<SensorReading> {
    return prisma.sensorReading.create({ data });
  }

  public async getSensorReadingsBySensorId(sensorId: string): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensorId } });
  }

  public async getSensorReadingsByHubId(hubId: string): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensor: { hubId } } });
  }

  public async getSensorReadingById(id: string): Promise<SensorReading | null> {
    return prisma.sensorReading.findUnique({ where: { id } });
  }

  public async getSensorReadingsBySensorIds(sensorIds: string[]): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensorId: { in: sensorIds } } });
  }

  public async getLatestSensorReadingBySensorId(sensorId: string): Promise<SensorReading | null> {
    return prisma.sensorReading.findFirst({ where: { sensorId }, orderBy: { date: 'desc' } });
  }

  public async getSensorReadingsByDateRange(sensorId: string, startDate: Date, endDate: Date): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensorId, date: { gte: startDate, lte: endDate } } });
  }

  public async getSensorReadingsAverageForPastFourHours(sensorId: string): Promise<SensorReading[]> {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    return prisma.sensorReading.findMany({ where: { sensorId, date: { gte: fourHoursAgo } } });
  }

  public async updateSensorReading(id: string, data: Prisma.SensorReadingUpdateInput): Promise<SensorReading> {
    return prisma.sensorReading.update({ where: { id }, data });
  }

  public async deleteSensorReading(id: string): Promise<void> {
    await prisma.sensorReading.delete({ where: { id } });
  }
}

export default new SensorReadingDao();
