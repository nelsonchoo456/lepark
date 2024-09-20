import { PrismaClient, Prisma, Sensor } from '@prisma/client';
import { SensorSchemaType } from '../schemas/sensorSchema';

const prisma = new PrismaClient();

class SensorDao {
  async createSensor(data: Prisma.SensorCreateInput): Promise<Sensor> {
    return prisma.sensor.create({ data });
  }

  async getAllSensors(): Promise<Sensor[]> {
    return prisma.sensor.findMany({
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                facilityName: true,
                parkId: true,
              },
            },
          },
        },
      },
    });
  }

  async getSensorById(id: string): Promise<Sensor | null> {
    return prisma.sensor.findUnique({
      where: { id },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                facilityName: true,
                parkId: true,
              },
            },
          },
        },
      },
    });
  }

  async updateSensor(id: string, data: Partial<SensorSchemaType>): Promise<Sensor> {
    return prisma.sensor.update({
      where: { id },
      data,
    });
  }

  async deleteSensor(id: string): Promise<void> {
    await prisma.sensor.delete({ where: { id } });
  }

  async getSensorsByHubId(hubId: string): Promise<Sensor[]> {
    return prisma.sensor.findMany({
      where: { hubId },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                facilityName: true,
                parkId: true,
              },
            },
          },
        },
      },
    });
  }

  async getSensorsByParkId(parkId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({
      where: {
        hub: {
          facility: {
            parkId,
          },
        },
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                facilityName: true,
                parkId: true,
              },
            },
          },
        },
      },
    });
  }

  async getSensorsNeedingCalibration(): Promise<Sensor[]> {
    const currentDate = new Date();
    return prisma.sensor.findMany({
      where: {
        lastCalibratedDate: {
          lte: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000), // More than a day old
        },
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                facilityName: true,
                parkId: true,
              },
            },
          },
        },
      },
    });
  }

  async getSensorsNeedingMaintenance(): Promise<Sensor[]> {
    const currentDate = new Date();
    return prisma.sensor.findMany({
      where: {
        nextMaintenanceDate: {
          lte: currentDate,
        },
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                facilityName: true,
                parkId: true,
              },
            },
          },
        },
      },
    });
  }
}

export default new SensorDao();
