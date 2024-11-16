import { PrismaClient, Prisma, DecarbonizationArea, Occurrence } from '@prisma/client';

const prisma = new PrismaClient();

class DecarbonizationAreaDao {
  public async createDecarbonizationArea(
    data: Prisma.DecarbonizationAreaCreateInput
  ): Promise<DecarbonizationArea> {
    return prisma.decarbonizationArea.create({
      data,
    });
  }

  public async getDecarbonizationAreaById(
    id: string
  ): Promise<DecarbonizationArea | null> {
    return prisma.decarbonizationArea.findUnique({
      where: { id },
    });
  }

  public async updateDecarbonizationArea(
    id: string, 
    data: Prisma.DecarbonizationAreaUpdateInput
  ): Promise<DecarbonizationArea> {
    return prisma.decarbonizationArea.update({
      where: { id },
      data,
    });
  }

  public async deleteDecarbonizationArea(
    id: string
  ): Promise<void> {
    await prisma.decarbonizationArea.delete({
      where: { id },
    });
  }

  public async getAllDecarbonizationAreas(): Promise<DecarbonizationArea[]> {
    return prisma.decarbonizationArea.findMany();
  }

  public async getDecarbonizationAreasByParkId(
    parkId: number
  ): Promise<DecarbonizationArea[]> {
    return prisma.decarbonizationArea.findMany({
      where: { parkId },
    });
  }

  public async getOccurrencesWithinDecarbonizationArea(
    areaId: string
  ): Promise<Occurrence[]> {
    const area = await this.getDecarbonizationAreaById(areaId);
    if (!area) {
      throw new Error('Decarbonization area not found');
    }

    return prisma.$queryRaw<Occurrence[]>`
      SELECT * FROM "Occurrence"
      WHERE ST_Contains(
        ST_GeomFromText(${area.geom}),
        ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)
      )
    `;
  }
}

export default new DecarbonizationAreaDao();
