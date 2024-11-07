import { PrismaClient, Prisma, FAQ } from '@prisma/client';

const prisma = new PrismaClient();

class FAQDao {
  public async createFAQ(
    data: Prisma.FAQCreateInput
  ): Promise<FAQ> {
    return prisma.fAQ.create({
      data,
    });
  }

  public async getFAQById(
    id: string
  ): Promise<FAQ | null> {
    return prisma.fAQ.findUnique({
      where: { id },
    });
  }

  public async updateFAQ(
    id: string, 
    data: Prisma.FAQUpdateInput
  ): Promise<FAQ> {
    return prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  public async deleteFAQ(
    id: string
  ): Promise<void> {
    await prisma.fAQ.delete({
      where: { id },
    });
  }

  public async getAllFAQs(): Promise<FAQ[]> {
    return prisma.fAQ.findMany({
      orderBy: {
        priority: 'asc',
      },
    });
  }

  public async getFAQsByParkId(
    parkId: number
  ): Promise<FAQ[]> {
    return prisma.fAQ.findMany({
      where: { parkId },
      orderBy: {
        priority: 'asc',
      },
    });
  }
}

export default new FAQDao();
