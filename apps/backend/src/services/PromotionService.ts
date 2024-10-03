import { PrismaClient, Prisma, Promotion } from '@prisma/client';
import ParkDao from '../dao/ParkDao';
import PromotionDao from '../dao/PromotionDao';
import EventDao from '../dao/EventDao';
import AttractionDao from '../dao/AttractionDao';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { ParkResponseData } from '../schemas/parkSchema';

const prisma = new PrismaClient();

class PromotionService {
  // Create a new promotion
  async createPromotion(data: Prisma.PromotionCreateInput): Promise<Promotion> {
    try {
      if (data.parkId) {
        const park = await ParkDao.getParkById(data.parkId);
        if (!park) {
          throw new Error('Park not found');
        }
      } else {
        throw new Error('Park ID required.');
      }

      if (data.attractions) {
        //
      } else if (data.events) {
        //
      }

      return prisma.promotion.create({ data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  // Get all promotions with associated parks, events, and attractions
  async getAllPromotions(): Promise<(Promotion & { park: ParkResponseData })[]> {
    const promotions = await PromotionDao.getAllPromotions();
    const parks = await ParkDao.getAllParks();
    return promotions.map((promotion) => {
      const park = parks.find((p: any) => p.id === promotion.parkId);
      return {
        ...promotion,
        park // Add the park details to the promotion
      };
    });
  }

  // Get promotion by ID
  async getPromotionById(id: string): Promise<(Promotion & { park: ParkResponseData })> {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
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
    const park = await ParkDao.getParkById(promotion.parkId);
    return {...promotion, park};
  }

  // Get all promotions for a specific park
  async getPromotionsByParkId(parkId: string): Promise<Promotion[]> {
    const id = parseInt(parkId);
    return prisma.promotion.findMany({
      where: {
        parkId: id,
      },
    });
  }

  // Get all promotions for a specific event
  async getPromotionsByEventId(eventId: string, parkId?: number): Promise<Promotion[]> {
    if (parkId) {
      return prisma.promotion.findMany({
        where: {
          parkId: parkId,
          events: {
            some: {
              eventId: eventId,
            },
          },
        },
      });
    }

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

  // Get all promotions for a specific attraction
  async getPromotionsByAttractionId(attractionId: string, parkId?: number): Promise<Promotion[]> {
    if (parkId) {
      return prisma.promotion.findMany({
        where: {
          parkId: parkId,
          attractions: {
            some: {
              attractionId: attractionId,
            },
          },
        },
      });
    }

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

  // Update promotion details
  async updatePromotionDetails(id: string, data: Prisma.PromotionUpdateInput): Promise<Promotion> {
    return prisma.promotion.update({
      where: { id },
      data,
    });
  }

  async deletePromotion(id: string): Promise<void> {
    await prisma.promotion.delete({ where: { id } });
  }

  async getPromotionsByIds(ids: string[]): Promise<Promotion[]> {
    return prisma.promotion.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}

export default new PromotionService();
