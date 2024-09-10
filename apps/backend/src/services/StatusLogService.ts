import { Prisma, StatusLog } from '@prisma/client';
import { z } from 'zod';
import { StatusLogSchema, StatusLogSchemaType } from '../schemas/statusLogSchema';
import StatusLogDao from '../dao/StatusLogDao';
import { fromZodError } from 'zod-validation-error';

class StatusLogService {
  public async createStatusLog(data: StatusLogSchemaType): Promise<StatusLog> {
    try {
      const formattedData = dateFormatter(data);

      StatusLogSchema.parse(formattedData);

      const statusLogData = ensureAllFieldsPresent(formattedData);

      return StatusLogDao.createStatusLog(statusLogData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getStatusLogsByOccurrenceId(occurrenceId: string): Promise<StatusLog[]> {
    return StatusLogDao.getStatusLogsByOccurrenceId(occurrenceId);
  }

  public async getStatusLogById(id: string): Promise<StatusLog> {
    const statusLog = await StatusLogDao.getStatusLogById(id);
    if (!statusLog) {
      throw new Error('Status log not found');
    }
    return statusLog;
  }

  public async updateStatusLog(id: string, data: Partial<StatusLogSchemaType>): Promise<StatusLog> {
    try {
      const existingStatusLog = await this.getStatusLogById(id);
      const formattedData = dateFormatter(data);

      const mergedData = { ...existingStatusLog, ...formattedData };
      StatusLogSchema.parse(mergedData);

      const updateData: Prisma.StatusLogUpdateInput = Object.entries(mergedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return StatusLogDao.updateStatusLog(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async deleteStatusLog(id: string): Promise<void> {
    await StatusLogDao.deleteStatusLog(id);
  }
}

function ensureAllFieldsPresent(data: StatusLogSchemaType): Prisma.StatusLogCreateInput {
  if (!data.name || !data.description || !data.dateCreated || !data.statusLogType || !data.occurrenceId) {
    throw new Error('Missing required fields for status log creation');
  }
  return data as Prisma.StatusLogCreateInput;
}

const dateFormatter = (data: any) => {
  const { dateCreated, ...rest } = data;
  const formattedData = { ...rest };

  const dateCreatedFormat = dateCreated ? new Date(dateCreated) : undefined;
  if (dateCreated) {
    formattedData.dateCreated = dateCreatedFormat;
  }
  return formattedData;
};

export default new StatusLogService();