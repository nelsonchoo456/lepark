import { PrismaClient, Hub, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class HubDao {
  public async createHub(data: Prisma.HubCreateInput): Promise<Hub> {
    return prisma.hub.create({ data });
  }

  public async getAllHubs(): Promise<Hub[]> {
    return prisma.hub.findMany();
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
