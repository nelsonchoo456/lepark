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
          facilityId: true,
        },
      },
      facility: {
        select: {
          id: true,
          facilityName: true,
          parkId: true,
        },
      },
    },
  });

  return sensors.map((sensor) => {
    return {
      ...sensor,
      hub: sensor.hub ? {
        id: sensor.hub.id,
        name: sensor.hub.name,
      } : null,
      facility: sensor.facility ? {
        id: sensor.facility.id,
        facilityName: sensor.facility.facilityName,
        parkId: sensor.facility.parkId,
      } : null,
    };
  });
}

 async getAllSensorsByFacilityId(facilityId: string): Promise<Sensor[]> {
    const sensors = await prisma.sensor.findMany({
      where: {
        facilityId,
      },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
          },
        },
        facility: {
          select: {
            id: true,
            facilityName: true,
            parkId: true,
          },
        },
      },
    });

    return sensors.map((sensor) => {
      return {
        ...sensor,
        hub: sensor.hub ? {
          id: sensor.hub.id,
          name: sensor.hub.name,
        } : null,
        facility: sensor.facility ? {
          id: sensor.facility.id,
          facilityName: sensor.facility.facilityName,
          parkId: sensor.facility.parkId,
        } : null,
      };
    });
  }

  async getSensorById(id: string): Promise<(Sensor & { facilityName?: string; parkId?: number }) | null> {
    const sensor = await prisma.sensor.findUnique({
      where: { id },
      include: {
        hub: {
          select: {
            id: true,
            name: true,
          },
        },
        facility: {
          select: {
            id: true,
            facilityName: true,
            parkId: true,
          },
        },
      },
    });

    if (sensor) {
      return {
        ...sensor,
        facilityId: sensor.facility?.id,
        facilityName: sensor.facility?.facilityName,
        parkId: sensor.facility?.parkId,
      };
    }

    return null;
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
          },
        },
        facility: {
          select: {
            id: true,
            facilityName: true,
            parkId: true,
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
          },
        },
        facility: {
          select: {
            id: true,
            facilityName: true,
            parkId: true,
          },
        },
      },
    });
  }
}

export default new SensorDao();
