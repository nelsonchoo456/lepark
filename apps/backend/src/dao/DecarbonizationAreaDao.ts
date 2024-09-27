import { PrismaClient, Prisma, DecarbonizationArea } from '@prisma/client';

const prisma = new PrismaClient();

class DecarbonizationAreaDao {
  async createDecarbonizationArea(data: Prisma.DecarbonizationAreaCreateInput): Promise<DecarbonizationArea> {
    return await prisma.decarbonizationArea.create({
      data,
    });
  }

  async getDecarbonizationAreaById(id: string): Promise<DecarbonizationArea | null> {
    return await prisma.decarbonizationArea.findUnique({
      where: { id },
    });
  }

  async updateDecarbonizationArea(id: string, data: Prisma.DecarbonizationAreaUpdateInput): Promise<DecarbonizationArea> {
    return await prisma.decarbonizationArea.update({
      where: { id },
      data,
    });
  }

  async deleteDecarbonizationArea(id: string): Promise<void> {
    await prisma.decarbonizationArea.delete({
      where: { id },
    });
  }

  async getAllDecarbonizationAreas(): Promise<DecarbonizationArea[]> {
    return await prisma.decarbonizationArea.findMany();
  }

  async getDecarbonizationAreasByParkId(parkId: number): Promise<DecarbonizationArea[]> {
    return await prisma.decarbonizationArea.findMany({
      where: { parkId },
    });
  }
}

export default new DecarbonizationAreaDao();
