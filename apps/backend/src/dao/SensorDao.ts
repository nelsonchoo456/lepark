import { PrismaClient, Prisma, Sensor, Hub, Facility, SensorTypeEnum, SensorStatusEnum } from '@prisma/client';
import HubDao from './HubDao';
import ParkDao from './ParkDao';
import { ParkResponseData } from '../schemas/parkSchema';

const prisma = new PrismaClient();

class SensorDao {
  public async createSensor(data: Prisma.SensorCreateInput): Promise<Sensor> {
    return prisma.sensor.create({ data });
  }

  public async getAllSensors(): Promise<(Sensor & {
    hub?: Hub;
    facility?: Facility;
    park?: ParkResponseData;
  })[]> {
    const sensors = await prisma.sensor.findMany({
      include: {
        hub: true,
        facility: true,
      },
    });

    const sensorsWithDetails = await Promise.all(
      sensors.map(async (sensor) => {
        let park;
        if (sensor.facility.parkId) {
          park = await ParkDao.getParkById(sensor.facility.parkId);
        }
        return { ...sensor, park: park || null };
      }),
    );

    return sensorsWithDetails;
  }

  public async getSensorsByParkId(parkId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({
      where: {
        OR: [{ facility: { parkId: parkId } }, { hub: { facility: { parkId: parkId } } }],
      },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            parkId: true,
          },
        },
        hub: {
          select: {
            id: true,
            name: true,
            zoneId: true,
            facility: true,
          },
        },
      },
    });
  }

  public async getSensorsByHubId(hubId: string): Promise<Sensor[]> {

    return await prisma.sensor.findMany({
      where: {
        hubId,
      },
    });
  }

  public async getAllSensorsByFacilityId(facilityId: string): Promise<Sensor[]> {
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
            name: true,
            parkId: true,
          },
        },
      },
    });

    return sensors.map((sensor) => {
      return {
        ...sensor,
        hub: sensor.hub
          ? {
              id: sensor.hub.id,
              name: sensor.hub.name,
            }
          : null,
        facility: sensor.facility
          ? {
              id: sensor.facility.id,
              name: sensor.facility.name,
              parkId: sensor.facility.parkId,
            }
          : null,
      };
    });
  }

  public async getSensorById(id: string): Promise<Sensor | null> {
    return prisma.sensor.findUnique({
      where: { id },
      include: {
        hub: true,
        facility: true,
      },
    });
  }

  public async getSensorByIdentifierNumber(identifierNumber: string): Promise<Sensor | null> {
    return prisma.sensor.findUnique({ where: { identifierNumber }, include: { hub: true, facility: true } });
  }

  public async getSensorBySerialNumber(serialNumber: string): Promise<Sensor | null> {
    return prisma.sensor.findUnique({ where: { serialNumber } });
  }

  public async getSensorsByZoneId(zoneId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({ where: { hub: { zoneId } } });
  }

  public async getPlantSensorsByZoneId(zoneId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({ where: { hub: { zoneId }, sensorType: { in: [SensorTypeEnum.SOIL_MOISTURE, SensorTypeEnum.TEMPERATURE, SensorTypeEnum.LIGHT, SensorTypeEnum.HUMIDITY] } } });
  }

  public async getSensorsByZoneIdAndType(zoneId: number, sensorType: SensorTypeEnum): Promise<Sensor[]> {
    return prisma.sensor.findMany({ where: { hub: { zoneId }, sensorType } });
  }

  public async getSensorsByHubIdAndType(hubId: string, sensorType: SensorTypeEnum): Promise<Sensor[]> {
    return prisma.sensor.findMany({ where: { hubId, sensorType } });
  }

  public async updateSensor(id: string, data: Prisma.SensorUpdateInput): Promise<Sensor> {
    return prisma.sensor.update({
      where: { id },
      data,
    });
  }

  public async deleteSensor(id: string): Promise<void> {
    await prisma.sensor.delete({ where: { id } });
  }

  public async getSensorsNeedingMaintenance(): Promise<Sensor[]> {
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
            name: true,
            parkId: true,
          },
        },
      },
    });
  }

  public async isSerialNumberDuplicate(serialNumber: string, excludeSensorId?: string): Promise<boolean> {
    const sensor = await prisma.sensor.findFirst({
      where: {
        serialNumber,
        id: { not: excludeSensorId }, // Exclude the current sensor when updating
      },
    });
    return !!sensor;
  }
}

export default new SensorDao();
