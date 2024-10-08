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

  public async updateSensorReading(id: string, data: Prisma.SensorReadingUpdateInput): Promise<SensorReading> {
    return prisma.sensorReading.update({ where: { id }, data });
  }

  public async deleteSensorReading(id: string): Promise<void> {
    await prisma.sensorReading.delete({ where: { id } });
  }
}

export default new SensorReadingDao();
