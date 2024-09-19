import { PrismaClient, Prisma, Attraction } from '@prisma/client';

const prisma = new PrismaClient();

class AttractionDao {
  async createAttraction(data: Prisma.AttractionCreateInput): Promise<Attraction> {
    return prisma.attraction.create({ data });
  }

  async getAllAttractions(): Promise<Attraction[]> {
    return prisma.attraction.findMany();
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