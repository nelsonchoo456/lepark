import { PrismaClient, Hub, Prisma, Facility, Sensor, HubStatusEnum, SensorStatusEnum } from '@prisma/client';
import ParkDao from './ParkDao';
import FacilityDao from './FacilityDao';
import ZoneDao from './ZoneDao';
import { ParkResponseData } from '../schemas/parkSchema';
import { ZoneResponseData } from '../schemas/zoneSchema';

const prisma = new PrismaClient();

class HubDao {
  public async createHub(data: Prisma.HubCreateInput): Promise<Hub> {
    return prisma.hub.create({ data });
  }

  public async getAllHubs(): Promise<(Hub & { facility?: Facility; park?: ParkResponseData; zone?: ZoneResponseData })[]> {
    const hubs = await prisma.hub.findMany({
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
    });

    const hubsWithDetails = await Promise.all(
      hubs.map(async (hub) => {
        let facility, park, zone;

        if (hub.facilityId) {
          const fetchedFacility = await FacilityDao.getFacilityById(hub.facilityId);
          facility = fetchedFacility;

          if (facility?.parkId) {
            const fetchedPark = await ParkDao.getParkById(facility.parkId);
            park = fetchedPark;
          }
        }

        if (hub.zoneId) {
          const fetchedZone = await ZoneDao.getZoneById(hub.zoneId);
          zone = fetchedZone;
        }

        return {
          ...hub,
          facility: facility || null,
          park: park || null,
          zone: zone || null,
        };
      }),
    );

    return hubsWithDetails;
  }

  public async getHubsFiltered(hubStatus: any, parkId: number): Promise<(Hub & { facility?: Facility; park?: ParkResponseData; zone?: ZoneResponseData })[]> {
    const hubs = await prisma.hub.findMany({
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
      where: {
        hubStatus: hubStatus ? hubStatus as HubStatusEnum : undefined,
        facility: parkId ? { parkId } : undefined
      },
    });

    const hubsWithDetails = await Promise.all(
      hubs.map(async (hub) => {
        let facility, park, zone;

        if (hub.facilityId) {
          const fetchedFacility = await FacilityDao.getFacilityById(hub.facilityId);
          facility = fetchedFacility;

          if (facility?.parkId) {
            const fetchedPark = await ParkDao.getParkById(facility.parkId);
            park = fetchedPark;
          }
        }

        if (hub.zoneId) {
          const fetchedZone = await ZoneDao.getZoneById(hub.zoneId);
          zone = fetchedZone;
        }

        return {
          ...hub,
          facility: facility || null,
          park: park || null,
          zone: zone || null,
        };
      }),
    );

    return hubsWithDetails;
  }

  public async getHubsByParkId(parkId: number): Promise<Hub[]> {
    // Fetch hubs by parkId
    const hubs = await prisma.hub.findMany({
      where: { facility: { parkId } },
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
    });

    // Fetch park information using ParkDao
    const park = await ParkDao.getParkById(parkId);

    // Map hubs to include facility name and park information
    return hubs.map((hub) => ({
      ...hub,
      facilityName: hub.facility?.name,
      parkName: park?.name,
    }));
  }

  public async getHubById(id: string): Promise<Hub | null> {
    return prisma.hub.findUnique({
      where: { id },
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
    });
  }

  public async getHubByIdentifierNumber(identifierNumber: string): Promise<Hub | null> {
    return prisma.hub.findUnique({
      where: { identifierNumber },
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
    });
  }

  public async getHubBySerialNumber(serialNumber: string): Promise<Hub | null> {
    return prisma.hub.findUnique({
      where: { serialNumber },
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
    });
  }

  public async getHubByRadioGroup(radioGroup: number): Promise<Hub | null> {
    return prisma.hub.findFirst({
      where: { radioGroup: { equals: radioGroup } },
      include: {
        facility: true,
        sensors: true,
        maintenanceHistory: true,
      },
    });
  }

  public async updateHubDetails(id: string, data: Prisma.HubUpdateInput): Promise<Hub> {
    return prisma.hub.update({ where: { id }, data });
  }

  public async deleteHub(id: string): Promise<void> {
    await prisma.hub.delete({ where: { id } });
  }

  public async getAllSensorsByHubId(hubId: string): Promise<Sensor[]> {
    if (!hubId) {
      return [];
    }
    const sensors = await prisma.sensor.findMany({
      where: { hubId: { equals: hubId } },
    });
    return sensors;
  }

  public async getAllActiveSensorsByHubId(hubId: string): Promise<Sensor[]> {
    return prisma.sensor.findMany({ where: { hubId, sensorStatus: SensorStatusEnum.ACTIVE } });
  }

  public async isSerialNumberDuplicate(serialNumber: string, excludeHubId?: string): Promise<boolean> {
    const hub = await prisma.hub.findFirst({
      where: {
        serialNumber,
        id: { not: excludeHubId }, // Exclude the current hub when updating
      },
    });
    return !!hub;
  }

  public async doesHubHaveSensors(hubId: string): Promise<boolean> {
    const hub = await prisma.hub.findUnique({
      where: { id: hubId },
      include: { sensors: true },
    });
    return hub?.sensors.length > 0;
  }

  public async getHubsByZoneId(zoneId: number): Promise<Hub[]> {
    return prisma.hub.findMany({ where: { zoneId } });
  }
}

export default new HubDao();
