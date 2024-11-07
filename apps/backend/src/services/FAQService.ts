import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import FAQDao from '../dao/FAQDao';
import { FAQSchema, FAQSchemaType } from '../schemas/faqSchema';
import { FAQ, Prisma } from '@prisma/client';

class FAQService {
  public async createFAQ(
    data: FAQSchemaType
  ): Promise<FAQ> {
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

  public async getFAQById(
    id: string
  ): Promise<FAQ | null> {
    return FAQDao.getFAQById(id);
  }

  public async updateFAQ(
    id: string, 
    data: Partial<FAQSchemaType>
  ): Promise<FAQ> {
    try {
      FAQSchema.parse(data);
      const transformedData: Prisma.FAQUpdateInput = {
        ...data,
      };
      return FAQDao.updateFAQ(id, transformedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteFAQ(
    id: string
  ): Promise<void> {
    await FAQDao.deleteFAQ(id);
  }

  public async getAllFAQs(): Promise<FAQ[]> {
    return FAQDao.getAllFAQs();
  }

  public async getFAQsByParkId(
    parkId: number
  ): Promise<FAQ[]> {
    return FAQDao.getFAQsByParkId(parkId);
  }

  public async updateFAQPriorities(
    faqs: { id: string; priority: number }[]
  ): Promise<void> {
    const updatePromises = faqs.map((faq) => 
      FAQDao.updateFAQ(faq.id, { priority: faq.priority })
    );
    await Promise.all(updatePromises);
  }
}

export default new FAQService();
