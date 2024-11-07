import { PrismaClient, Prisma, Promotion } from '@prisma/client';

const prisma = new PrismaClient();

class PromotionDao {
  // Create a new promotion
  public async createPromotion(data: Prisma.PromotionCreateInput): Promise<Promotion> {
    return prisma.promotion.create({ data });
  }

  // Retrieve all promotions
  public async getAllPromotions(): Promise<Promotion[]> {
    return prisma.promotion.findMany();
  }

  public async getAllPromotionsFiltered(archived: boolean, enabled: boolean): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        validUntil: archived ? { lt: new Date() } : { gte: new Date() },
        status: enabled ? 'ENABLED' : undefined,
      },
    });
  }

  // Retrieve promotion by its ID
  public async getPromotionById(id: string): Promise<Promotion | null> {
    return prisma.promotion.findUnique({ where: { id } });
  }

  // Update promotion details
  public async updatePromotion(id: string, data: Prisma.PromotionUpdateInput): Promise<Promotion> {
    return prisma.promotion.update({ where: { id }, data });
  }

  public async deletePromotion(id: string): Promise<void> {
    await prisma.promotion.delete({ where: { id } });
  }

  public async getPromotionsForNParksAndParkId(parkId: number, archived: boolean, enabled: boolean): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        OR: [
          { isNParksWide: true }, 
          { parkId: parkId }    
        ],
        validUntil: archived ? { lt: new Date() } : { gte: new Date() },
        status: enabled ? 'ENABLED' : undefined,
      },
    });
  }

  public async getPromotionsForNParks(archived: boolean, enabled: boolean): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        isNParksWide: true,
        validUntil: archived ? { lt: new Date() } : { gte: new Date() },
        status: enabled ? 'ENABLED' : undefined,
      },
    });
  }

  public async getPromotionsByParkId(parkId: number): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: { parkId },
    });
  }

  public async getPromotionsByParkIdFiltered(parkId: number, archived: boolean, enabled: boolean): Promise<Promotion[]> {
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
