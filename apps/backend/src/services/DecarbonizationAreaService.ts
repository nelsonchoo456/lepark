import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import DecarbonizationAreaDao from '../dao/DecarbonizationAreaDao';
import {
  DecarbonizationAreaCreateData,
  DecarbonizationAreaCreateSchema,
  DecarbonizationAreaUpdateData,
  DecarbonizationAreaUpdateSchema,
} from '../schemas/decarbonizationAreaSchema';
import { Prisma } from '@prisma/client';

class DecarbonizationAreaService {
  async createDecarbonizationArea(data: DecarbonizationAreaCreateData) {
    try {
      DecarbonizationAreaCreateSchema.parse(data);
      // Transform the data to match Prisma.DecarbonizationAreaCreateInput
      const transformedData: Prisma.DecarbonizationAreaCreateInput = {
        name: data.name,
        description: data.description,
        geom: `SRID=4326;${data.geom}`,
        parkId: data.parkId,
      };
      return await DecarbonizationAreaDao.createDecarbonizationArea(transformedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  async getDecarbonizationAreaById(id: string) {
    return await DecarbonizationAreaDao.getDecarbonizationAreaById(id);
  }

  async updateDecarbonizationArea(id: string, data: DecarbonizationAreaUpdateData) {
    try {
      DecarbonizationAreaUpdateSchema.parse(data);
      // Transform the data to match Prisma.DecarbonizationAreaUpdateInput
      const transformedData: Prisma.DecarbonizationAreaUpdateInput = {
        name: data.name,
        description: data.description,
        geom: data.geom ? `SRID=4326;${data.geom}` : undefined,
        parkId: data.parkId,
      };
      return await DecarbonizationAreaDao.updateDecarbonizationArea(id, transformedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  async deleteDecarbonizationArea(id: string) {
    await DecarbonizationAreaDao.deleteDecarbonizationArea(id);
  }

  async getAllDecarbonizationAreas() {
    return await DecarbonizationAreaDao.getAllDecarbonizationAreas();
  }

  async getDecarbonizationAreasByParkId(parkId: number) {
    return await DecarbonizationAreaDao.getDecarbonizationAreasByParkId(parkId);
  }
}

export default new DecarbonizationAreaService();
