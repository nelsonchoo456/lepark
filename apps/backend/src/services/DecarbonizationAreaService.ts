import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import DecarbonizationAreaDao from '../dao/DecarbonizationAreaDao';
import {
  DecarbonizationAreaCreateData,
  DecarbonizationAreaCreateSchema,
  DecarbonizationAreaUpdateData,
  DecarbonizationAreaUpdateSchema,
} from '../schemas/decarbonizationAreaSchema';
import { DecarbonizationArea, Occurrence, Prisma } from '@prisma/client';

class DecarbonizationAreaService {
  public async createDecarbonizationArea(
    data: DecarbonizationAreaCreateData
  ): Promise<DecarbonizationArea> {
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

  public async getDecarbonizationAreaById(
    id: string
  ): Promise<DecarbonizationArea | null> {
    return DecarbonizationAreaDao.getDecarbonizationAreaById(id);
  }

  public async updateDecarbonizationArea(
    id: string, 
    data: DecarbonizationAreaUpdateData
  ): Promise<DecarbonizationArea> {
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

  public async deleteDecarbonizationArea(
    id: string
  ): Promise<void> {
    await DecarbonizationAreaDao.deleteDecarbonizationArea(id);
  }

  public async getAllDecarbonizationAreas(): Promise<DecarbonizationArea[]> {
    return DecarbonizationAreaDao.getAllDecarbonizationAreas();
  }

  public async getDecarbonizationAreasByParkId(
    parkId: number
  ): Promise<DecarbonizationArea[]> {
    return DecarbonizationAreaDao.getDecarbonizationAreasByParkId(parkId);
  }

  public async getOccurrencesWithinDecarbonizationArea(
    areaId: string
  ): Promise<Occurrence[]> {
    return DecarbonizationAreaDao.getOccurrencesWithinDecarbonizationArea(areaId);
  }
}

export default new DecarbonizationAreaService();
