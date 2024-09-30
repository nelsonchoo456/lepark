import { PrismaClient, Prisma, Attraction } from '@prisma/client';

const prisma = new PrismaClient();

class AttractionDao {
  async createAttraction(data: Prisma.AttractionCreateInput): Promise<Attraction> {
    return prisma.attraction.create({ data });
  }

  async checkAttractionNameExists(parkId: number, title: string): Promise<boolean> {
    const count = await prisma.attraction.count({
      where: {
        parkId,
        title: {
          equals: title,
          mode: 'insensitive', // This makes the search case-insensitive
        },
      },
    });
    return count > 0;
  }

  async getAllAttractions(): Promise<Attraction[]> {
    return prisma.attraction.findMany();
  }

  async getAttractionsByParkId(parkId: number): Promise<Attraction[]> {
    return prisma.attraction.findMany({ where: { parkId } });
  }

  async getAttractionById(id: string): Promise<Attraction | null> {
    return prisma.attraction.findUnique({ where: { id } });
  }

  async updateAttractionDetails(id: string, data: Prisma.AttractionUpdateInput): Promise<Attraction> {
    return prisma.attraction.update({ where: { id }, data });
  }

  async deleteAttraction(id: string): Promise<void> {
    await prisma.attraction.delete({ where: { id } });
  }

  async getAttractionByTitleAndParkId(title: string, parkId: number): Promise<Attraction | null> {
    return prisma.attraction.findFirst({ where: { title, parkId } });
  }
}

export default new AttractionDao();