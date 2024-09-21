import { PrismaClient, Prisma, Sensor } from '@prisma/client';
import HubDao from './HubDao';

const prisma = new PrismaClient();

class SensorDao {
  async createSensor(data: Prisma.SensorCreateInput): Promise<Sensor> {
    return prisma.sensor.create({ data });
  }

  async getAllSensors(): Promise<Sensor[]> {
    const sensors = await prisma.sensor.findMany({
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

    const hubs = await HubDao.getAllHubs();

    return sensors.map((sensor) => {
      const hub = hubs.find((h: any) => h.id === sensor.hubId);
      return {
        ...sensor,
        hubId: hub?.id,
        hubName: hub?.name,
        facilityId: hub?.facilityId,
      };
    });
  }

  async getAllSensorsByFacilityId(facilityId: string): Promise<Sensor[]> {
    const sensors = await prisma.sensor.findMany({
      where: {
        hub: {
          facilityId,
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

    const hubs = await HubDao.getAllHubs();

    return sensors.map((sensor) => {
      const hub = hubs.find((h: any) => h.id === sensor.hubId);
      return {
        ...sensor,
        hubId: hub?.id,
        hubName: hub?.name,
        facilityId: hub?.facilityId,
      };
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

  async updateSensor(id: string, data: Prisma.SensorUpdateInput): Promise<Sensor> {
    return prisma.sensor.update({
      where: { id },
      data,
    });
  }

  async deleteSensor(id: string): Promise<void> {
    await prisma.sensor.delete({ where: { id } });
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
