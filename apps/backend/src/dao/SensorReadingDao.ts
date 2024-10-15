import { PrismaClient, SensorReading, Prisma, SensorTypeEnum } from '@prisma/client';
import SensorDao from './SensorDao';

const prisma = new PrismaClient();

class SensorReadingDao {
  public async createSensorReading(data: Prisma.SensorReadingCreateInput): Promise<SensorReading> {
    return prisma.sensorReading.create({ data });
  }

  public async updateSensorReading(id: string, data: Prisma.SensorReadingUpdateInput): Promise<SensorReading> {
    return prisma.sensorReading.update({ where: { id }, data });
  }

  public async deleteSensorReading(id: string): Promise<void> {
    await prisma.sensorReading.delete({ where: { id } });
  }

  // Sensor
  public async getSensorReadingsBySensorId(sensorId: string): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensorId } });
  }

  public async getSensorReadingsBySensorIds(sensorIds: string[]): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensorId: { in: sensorIds } } });
  }

  public async getSensorReadingsHoursAgo(sensorId: string, hours: number): Promise<SensorReading[]> {
    const date = new Date(Date.now() - hours * 60 * 60 * 1000);
    return prisma.sensorReading.findMany({ where: { sensorId, date: { gte: date } } });
  }

  public async getAverageSensorReadingsForHoursAgo(sensorId: string, hours: number): Promise<number> {
    const readings = await this.getSensorReadingsHoursAgo(sensorId, hours);
    if (readings.length === 0) {
      return 0;
    }
    return readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length;
  }

  public async getSensorReadingsByDateRange(sensorId: string, startDate: Date, endDate: Date): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensorId, date: { gte: startDate, lte: endDate } } });
  }

  public async getLatestSensorReadingBySensorId(sensorId: string): Promise<SensorReading | null> {
    return prisma.sensorReading.findFirst({ where: { sensorId }, orderBy: { date: 'desc' } });
  }

  // Hub
  public async getAllSensorReadingsByHubIdAndSensorType(hubId: string, sensorType: SensorTypeEnum): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensor: { hubId, sensorType: sensorType } } });
  }

  public async getSensorReadingsByHubIdAndSensorTypeForHoursAgo(
    hubId: string,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({
      where: { sensor: { hubId, sensorType: sensorType }, date: { gte: new Date(Date.now() - hours * 60 * 60 * 1000) } },
    });
  }

  public async getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo(
    hubId: string,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<number> {
    const readings = await this.getSensorReadingsByHubIdAndSensorTypeForHoursAgo(hubId, sensorType, hours);
    if (readings.length === 0) {
      return 0;
    }
    return readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length;
  }

  public async getSensorReadingsByHubIdAndSensorTypeByDateRange(
    hubId: string,
    sensorType: SensorTypeEnum,
    startDate: Date,
    endDate: Date,
  ): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensor: { hubId, sensorType: sensorType }, date: { gte: startDate, lte: endDate } } });
  }

  public async getLatestSensorReadingByHubIdAndSensorType(hubId: string, sensorType: SensorTypeEnum): Promise<SensorReading | null> {
    return prisma.sensorReading.findFirst({ where: { sensor: { hubId, sensorType: sensorType } }, orderBy: { date: 'desc' } });
  }

  // Zone
  public async getAllSensorReadingsByZoneIdAndSensorType(zoneId: number, sensorType: SensorTypeEnum): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({ where: { sensor: { hub: { zoneId }, sensorType: sensorType } } });
  }

  public async getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(
    zoneId: number,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({
      where: { sensor: { hub: { zoneId }, sensorType: sensorType }, date: { gte: new Date(Date.now() - hours * 60 * 60 * 1000) } },
    });
  }

  public async getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo(
    zoneId: number,
    sensorType: SensorTypeEnum,
    hours: number,
  ): Promise<number> {
    const readings = await this.getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(zoneId, sensorType, hours);
    console.log('readings', readings.length);
    if (readings.length === 0) {
      return 0;
    }
    return readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length;
  }

  public async getSensorReadingsByZoneIdAndSensorTypeByDateRange(
    zoneId: number,
    sensorType: SensorTypeEnum,
    startDate: Date,
    endDate: Date,
  ): Promise<SensorReading[]> {
    return prisma.sensorReading.findMany({
      where: { sensor: { hub: { zoneId }, sensorType: sensorType }, date: { gte: startDate, lte: endDate } },
    });
  }

  public async getLatestSensorReadingByZoneIdAndSensorType(zoneId: number, sensorType: SensorTypeEnum): Promise<SensorReading | null> {
    return prisma.sensorReading.findFirst({ where: { sensor: { hub: { zoneId }, sensorType: sensorType } }, orderBy: { date: 'desc' } });
  }

  public async getActiveZonePlantSensorCount(zoneId: number, hoursAgo = 1): Promise<any> {
    const sensorTypes = [SensorTypeEnum.SOIL_MOISTURE, SensorTypeEnum.TEMPERATURE, SensorTypeEnum.LIGHT, SensorTypeEnum.HUMIDITY];
    const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const activeSensors = await prisma.sensor.count({
      where: {
        hub: { zoneId },
        sensorType: { in: sensorTypes },
        sensorReadings: {
          some: {
            date: { gte: date },
          },
        },
      },
    });
    return activeSensors;
  }

  public async getAverageDifferenceBetweenPeriodsBySensorType(
    zoneId: number,
    duration: number,
  ): Promise<{ [sensorType in SensorTypeEnum]: { firstPeriodAvg: number; secondPeriodAvg: number; difference: number } }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 2 * duration * 60 * 60 * 1000);
    const midDate = new Date(endDate.getTime() - duration * 60 * 60 * 1000);

    const result = {} as { [sensorType in SensorTypeEnum]: { firstPeriodAvg: number; secondPeriodAvg: number; difference: number } };

    for (const sensorType of Object.values(SensorTypeEnum)) {
      const [firstPeriodAvg, secondPeriodAvg] = await Promise.all([
        prisma.sensorReading.aggregate({
          _avg: { value: true },
          where: {
            sensor: { hub: { zoneId }, sensorType },
            date: { gte: startDate, lt: midDate },
          },
        }),
        prisma.sensorReading.aggregate({
          _avg: { value: true },
          where: {
            sensor: { hub: { zoneId }, sensorType },
            date: { gte: midDate, lte: endDate },
          },
        }),
      ]);

      const firstAvg = firstPeriodAvg._avg.value || 0;
      const secondAvg = secondPeriodAvg._avg.value || 0;

      result[sensorType] = {
        firstPeriodAvg: firstAvg,
        secondPeriodAvg: secondAvg,
        difference: secondAvg - firstAvg,
      };
    }

    return result;
  }
}

export default new SensorReadingDao();
