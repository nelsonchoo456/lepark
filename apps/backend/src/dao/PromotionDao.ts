import { PrismaClient, Prisma, Promotion } from '@prisma/client';

const prisma = new PrismaClient();

class PromotionDao {
  // Create a new promotion
  async createPromotion(data: Prisma.PromotionCreateInput): Promise<Promotion> {
    return prisma.promotion.create({ data });
  }

  // Retrieve all promotions
  async getAllPromotions(): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      include: {
        events: {
          select: {
            event: true, // Include the entire Event entity
          },
        },
        attractions: {
          select: {
            attraction: true, // Include the entire Attraction entity
          },
        },
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

  async findPromotionsByParkId(parkId: number): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        parkId: parkId,
      },
    });
  }

  // Find promotions by event ID (many-to-many relationship)
  async findPromotionsByEventId(eventId: string): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        events: {
          some: {
            eventId: eventId,
          },
        },
      },
    });
  }

  // Find promotions by attraction ID (many-to-many relationship)
  async findPromotionsByAttractionId(attractionId: string): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        attractions: {
          some: {
            attractionId: attractionId,
          },
        },
      },
    });
  }
}

export default new PromotionDao();
