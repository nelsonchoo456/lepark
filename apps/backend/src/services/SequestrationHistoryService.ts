import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import SequestrationHistoryDao from '../dao/SequestrationHistoryDao';
import { Prisma, SequestrationHistory } from '@prisma/client';
import { SequestrationHistorySchema, SequestrationHistorySchemaType } from '../schemas/sequestrationHistorySchema';

class SequestrationHistoryService {
  public async createSequestrationHistory(data: SequestrationHistorySchemaType): Promise<SequestrationHistory> {
    try {
      SequestrationHistorySchema.parse(data);
      const seqData = data as Prisma.SequestrationHistoryCreateInput;
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
      SequestrationHistorySchema.parse(data);
      return await SequestrationHistoryDao.updateSequestrationHistory(id, data);
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
}

export default new SequestrationHistoryService();
