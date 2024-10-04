import { PrismaClient, Prisma, Promotion } from '@prisma/client';
import ParkDao from '../dao/ParkDao';
import PromotionDao from '../dao/PromotionDao';
import aws from 'aws-sdk';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { ParkResponseData } from '../schemas/parkSchema';
import { PromotionSchema, PromotionSchemaType } from '../schemas/promotionSchema';

const prisma = new PrismaClient();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class PromotionService {
  // Create a new promotion
  async createPromotion(data: PromotionSchemaType): Promise<Promotion> {
    try {
      if (!data.isNParksWide) {
        if (!data.parkId) {
          throw new Error('Park ID required.');
        }
        const park = await ParkDao.getParkById(data.parkId);
        if (!park) {
          throw new Error('Park not found.');
        }
      }

      
      if (data.promoCode) {
        data.promoCode = data.promoCode.trim();
        const existingPromotion = await prisma.promotion.findFirst({
          where: { promoCode: {
            equals: data.promoCode,
            mode: 'insensitive',
          }, },
        });
  
        if (existingPromotion) {
          throw new Error('Please enter a unique Promo Code');
        }
      }
      
      const formattedData = dateFormatter(data);

      PromotionSchema.parse(formattedData);
      const promotionData = ensureAllFieldsPresent(formattedData);

      return PromotionDao.createPromotion(promotionData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  // Get all promotions with associated parks, events, and attractions
  async getAllPromotions(archived: boolean, enabled: boolean): Promise<(Promotion & { park?: ParkResponseData })[]> {
    let promotions;
    if (archived !== undefined && enabled !== undefined) {
      promotions = await PromotionDao.getAllPromotionsFiltered(archived, enabled);
    } else {
      promotions = await PromotionDao.getAllPromotions();
    }

    const parks = await ParkDao.getAllParks();
    return promotions.map((promotion) => {
      if (promotion.isNParksWide || !promotion.parkId) {
        return promotion;
      } else {
        const park = parks.find((p: any) => p.id === promotion.parkId);
        return {
          ...promotion,
          park,
        };
      }
    });
  }

  // Get promotion by ID
  async getPromotionById(id: string): Promise<Promotion & { park?: ParkResponseData }> {
    const promotion = await PromotionDao.getPromotionById(id);
    if (promotion.parkId) {
      const park = await ParkDao.getParkById(promotion.parkId);
      return { ...promotion, park };
    }

    return promotion;
  }

  async getPromotionsForNParksAndParkId(parkId: number, archived: boolean, enabled: boolean): Promise<Promotion[]> {
    const promotions =  await PromotionDao.getPromotionsForNParksAndParkId(parkId, archived, enabled);
    const parks = await ParkDao.getAllParks();
    return promotions.map((promotion) => {
      if (promotion.isNParksWide || !promotion.parkId) {
        return promotion;
      } else {
        const park = parks.find((p: any) => p.id === promotion.parkId);
        return {
          ...promotion,
          park,
        };
      }
    });
  }

  async getPromotionsForNParks(archived: boolean, enabled: boolean): Promise<Promotion[]> {
    return await PromotionDao.getPromotionsForNParks(archived, enabled);
  }

  // Get all promotions for a specific park
  async getPromotionsByParkId(parkId: string, archived: boolean, enabled: boolean): Promise<Promotion[]> {
    const id = parseInt(parkId);

    if (archived !== undefined && enabled !== undefined) {
      return await PromotionDao.getPromotionsByParkIdFiltered(id, archived, enabled);
    } else {
      return await PromotionDao.getPromotionsByParkId(id);
    }
  }

  // Update promotion details
  async updatePromotionDetails(id: string, data: Partial<PromotionSchemaType>): Promise<Promotion> {
    if (data.promoCode) {
      data.promoCode = data.promoCode.trim();
      const existingPromotion = await prisma.promotion.findFirst({
        where: { promoCode: {
          equals: data.promoCode,
          mode: 'insensitive',
        }, },
      });

      if (existingPromotion) {
        throw new Error('Please enter a unique Promo Code');
      }
    }
    
    const formattedData = dateFormatter(data);

    return PromotionDao.updatePromotion(id, formattedData);
  }

  async disablePromotion(id: string): Promise<void> {
    await prisma.promotion.delete({ where: { id } });
  }

  async deletePromotion(id: string): Promise<void> {
    await prisma.promotion.delete({ where: { id } });
  }


  async uploadImageToS3(fileBuffer, fileName, mimeType) {
    const params = {
      Bucket: 'lepark',
      Key: `promotion/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Error uploading image to S3');
    }
  }
}

const filterPromotions = (promotions: Promotion[], archived: boolean, enabled: boolean) => {
  const filteredPromotions = promotions.filter((promotion) => {
    const isArchived = new Date(promotion.validUntil) < new Date(); // Check if the promotion is archived (expired)
    const isEnabled = promotion.status === 'ENABLED'; // Check if the promotion is enabled

    // Apply the archived and enabled filters
    if (archived && enabled) {
      return isArchived && isEnabled;
    } else if (archived) {
      return isArchived;
    } else if (enabled) {
      return isEnabled;
    } else {
      return true; // Return all promotions if no filter is applied
    }
  });

  return filteredPromotions;
};

function ensureAllFieldsPresent(data: PromotionSchemaType): Prisma.PromotionCreateInput {
  // Add checks for all required fields
  if (
    !data.name ||
    !data.discountType ||
    !data.isNParksWide === undefined ||
    !data.discountValue ||
    !data.validFrom ||
    !data.validUntil ||
    !data.status ||
    !data.isOneTime === undefined
  ) {
    throw new Error('Missing required fields for Promotion creation');
  }

  return data as Prisma.PromotionCreateInput;
}

const dateFormatter = (data: any) => {
  const { validFrom, validUntil, ...rest } = data;
  const formattedData = { ...rest };

  if (validFrom) {
    formattedData.validFrom = new Date(validFrom);
  }
  if (validUntil) {
    formattedData.validUntil = new Date(validUntil);
  }

  return formattedData;
};

export default new PromotionService();
