import { PrismaClient, Prisma, FAQ } from '@prisma/client';

const prisma = new PrismaClient();

class FAQDao {
  async createFAQ(data: Prisma.FAQCreateInput): Promise<FAQ> {
    return await prisma.fAQ.create({
      data,
    });
  }

  async getFAQById(id: string): Promise<FAQ | null> {
    return await prisma.fAQ.findUnique({
      where: { id },
    });
  }

  async updateFAQ(id: string, data: Prisma.FAQUpdateInput): Promise<FAQ> {
    return await prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async deleteFAQ(id: string): Promise<void> {
    await prisma.fAQ.delete({
      where: { id },
    });
  }

  async getAllFAQs(): Promise<FAQ[]> {
    return await prisma.fAQ.findMany({
      orderBy: {
        priority: 'asc',
      },
    });
  }

  async getFAQsByParkId(parkId: number): Promise<FAQ[]> {
    return await prisma.fAQ.findMany({
      where: { parkId },
      orderBy: {
        priority: 'asc',
      },
    });
  }
}

export default new FAQDao();
