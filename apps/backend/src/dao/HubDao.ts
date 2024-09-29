import { PrismaClient, Hub, Prisma } from '@prisma/client';
import ParkDao from './ParkDao';
import FacilityDao from './FacilityDao';
import ZoneDao from './ZoneDao';

const prisma = new PrismaClient();

class HubDao {
  public async createHub(data: Prisma.HubCreateInput): Promise<Hub> {
    return prisma.hub.create({ data });
  }

  public async getAllHubs(): Promise<(Hub & { facilityName?: string; parkName?: string; zoneName?: string })[]> {
    const hubs = await prisma.hub.findMany({
      include: {
        facility: true,
      },
    });

    const hubsWithDetails = await Promise.all(hubs.map(async (hub) => {
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
    }));

    return hubsWithDetails;
  }

  public async getHubsByParkId(parkId: number): Promise<Hub[]> {
    // Fetch hubs by parkId
    const hubs = await prisma.hub.findMany({
      where: { facility: { parkId } },
      include: {
        facility: true,
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
      },
    });
  }

  public async getHubBySerialNumber(serialNumber: string): Promise<Hub | null> {
    return prisma.hub.findUnique({ where: { serialNumber } });
  }

  public async updateHubDetails(id: string, data: Prisma.HubUpdateInput): Promise<Hub> {
    return prisma.hub.update({ where: { id }, data });
  }

  public async deleteHub(id: string): Promise<void> {
    await prisma.hub.delete({ where: { id } });
  }
}

export default new HubDao();
