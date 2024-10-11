import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import FAQDao from '../dao/FAQDao';
import { FAQSchema, FAQSchemaType } from '../schemas/faqSchema';
import { Prisma } from '@prisma/client';

class FAQService {
  async createFAQ(data: FAQSchemaType) {
    try {
      FAQSchema.parse(data);
      const formattedData = data as Prisma.FAQCreateInput;
      return await FAQDao.createFAQ(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  async getFAQById(id: string) {
    return await FAQDao.getFAQById(id);
  }

  async updateFAQ(id: string, data: Partial<FAQSchemaType>) {
    try {
      FAQSchema.parse(data);
      const transformedData: Prisma.FAQUpdateInput = {
        ...data,
      };
      return await FAQDao.updateFAQ(id, transformedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  async deleteFAQ(id: string) {
    await FAQDao.deleteFAQ(id);
  }

  async getAllFAQs() {
    return await FAQDao.getAllFAQs();
  }

  async getFAQsByParkId(parkId: number) {
    return await FAQDao.getFAQsByParkId(parkId);
  }
}

export default new FAQService();