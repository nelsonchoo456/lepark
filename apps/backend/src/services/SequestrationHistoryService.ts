import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import SequestrationHistoryDao from '../dao/SequestrationHistoryDao';
import { Prisma, SequestrationHistory } from '@prisma/client';
import { SequestrationHistorySchema, SequestrationHistorySchemaType } from '../schemas/sequestrationHistorySchema';

class SequestrationHistoryService {
  public async createSequestrationHistory(data: SequestrationHistorySchemaType): Promise<SequestrationHistory> {
    try {
      // Format date fields
      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      SequestrationHistorySchema.parse(formattedData);

      // Convert validated data to Prisma input type
      const seqData = formattedData as Prisma.SequestrationHistoryCreateInput;
      return await SequestrationHistoryDao.createSequestrationHistory(seqData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async updateSequestrationHistory(id: string, data: Partial<SequestrationHistorySchemaType>): Promise<SequestrationHistory> {
    try {
      // Format date fields
      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      SequestrationHistorySchema.parse(formattedData);

      return await SequestrationHistoryDao.updateSequestrationHistory(id, formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteSequestrationHistory(id: string): Promise<void> {
    await SequestrationHistoryDao.deleteSequestrationHistory(id);
  }

  public async getSequestrationHistoryByAreaId(areaId: string): Promise<SequestrationHistory[]> {
    return await SequestrationHistoryDao.getSequestrationHistoryByAreaId(areaId);
  }

  public async getSequestrationHistoryByAreaIdAndTimeFrame(
    areaId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SequestrationHistory[]> {
    return await SequestrationHistoryDao.getSequestrationHistoryByAreaIdAndTimeFrame(areaId, startDate, endDate);
  }
}

// Utility function to format date fields
const dateFormatter = (data: any) => {
  const { date, ...rest } = data;
  const formattedData = { ...rest };

  // Format date into JavaScript Date object
  const dateFormat = date ? new Date(date) : undefined;
  if (date) {
    formattedData.date = dateFormat;
  }
  return formattedData;
};

export default new SequestrationHistoryService();
