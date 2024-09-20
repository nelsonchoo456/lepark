import { PrismaClient, Hub, Prisma } from '@prisma/client';
import ParkDao from './ParkDao';

const prisma = new PrismaClient();

class HubDao {
  public async createHub(data: Prisma.HubCreateInput): Promise<Hub> {
    return prisma.hub.create({ data });
  }

  public async getAllHubs(): Promise<Hub[]> {
    // Fetch all hubs with their related facility information
    const hubs = await prisma.hub.findMany({
      include: {
        facility: true,
      },
    });

    // Fetch park information for each facility
    const parkPromises = hubs.map((hub) => {
      if (hub.facility?.parkId) {
        return ParkDao.getParkById(hub.facility.parkId);
      }
      return Promise.resolve(null);
    });

    const parks = await Promise.all(parkPromises);

    // Map hubs to include facility name and park information
    return hubs.map((hub, index) => ({
      ...hub,
      facilityName: hub.facility?.facilityName,
      parkName: parks[index]?.name,
    }));
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
      facilityName: hub.facility?.facilityName,
      parkName: park?.name,
    }));
  }

  public async getHubById(id: string): Promise<Hub | null> {
    return prisma.hub.findUnique({ where: { id } });
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
