import { PrismaClient, Prisma, DecarbonizationArea, Occurrence } from '@prisma/client';

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

  async getOccurrencesWithinDecarbonizationArea(areaId: string): Promise<Occurrence[]> {
    const area = await this.getDecarbonizationAreaById(areaId);
    if (!area) {
      throw new Error('Decarbonization area not found');
    }

    const occurrences = await prisma.$queryRaw<Occurrence[]>`
      SELECT * FROM "Occurrence"
      WHERE ST_Contains(
        ST_GeomFromText(${area.geom}),
        ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)
      )
    `;
    return occurrences;
  }
}

export default new DecarbonizationAreaDao();
