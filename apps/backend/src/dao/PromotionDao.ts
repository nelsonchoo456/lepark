import { PrismaClient, Prisma, Promotion } from '@prisma/client';

const prisma = new PrismaClient();

class PromotionDao {
  // Create a new promotion
  async createPromotion(data: Prisma.PromotionCreateInput): Promise<Promotion> {
    return prisma.promotion.create({ data });
  }

  // Retrieve all promotions
  async getAllPromotions(): Promise<Promotion[]> {
    return prisma.promotion.findMany();
  }

  async getAllPromotionsFiltered(archived: boolean, enabled: boolean): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        validUntil: archived ? { lt: new Date() } : { gte: new Date() },
        status: enabled ? 'ENABLED' : undefined,
      },
    });
  }

  // Retrieve promotion by its ID
  async getPromotionById(id: string): Promise<Promotion | null> {
    return prisma.promotion.findUnique({ where: { id } });
  }

  // Update promotion details
  async updatePromotion(id: string, data: Prisma.PromotionUpdateInput): Promise<Promotion> {
    return prisma.promotion.update({ where: { id }, data });
  }

  async deletePromotion(id: string): Promise<void> {
    await prisma.promotion.delete({ where: { id } });
  }

  async getPromotionsByParkId(parkId: number): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        parkId: parkId,
      },
    });
  }

  async getPromotionsByParkIdFiltered(parkId: number, archived: boolean, enabled: boolean): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        parkId: parkId,
        validUntil: archived ? { lt: new Date() } : { gte: new Date() },
        status: enabled ? 'ENABLED' : undefined,
      },
    });
  }
}

export default new PromotionDao();
