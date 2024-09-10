import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { OccurrenceSchemaType } from '../schemas/occurrenceSchema';
import { fromZodError } from 'zod-validation-error';
import { ZoneCreateData } from '../schemas/zoneSchema';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';

class ZoneService {
  public async createZone(data: ZoneCreateData): Promise<any> {
    try {
      if (data.parkId) {
        const park = await ParkDao.getParkById(data.parkId);
        if (!park) {
          throw new Error('Park not found.');
        }
      }

      const errors: string[] = []
      if (!data.name || data.name.length < 3) {
        errors.push('Valid name is required');
      }
      if (!data.openingHours || data.openingHours.length != 7) {
        errors.push('Opening Hours are required');
      }
      if (!data.closingHours || data.closingHours.length != 7) {
        errors.push('Closing Hours are required');
      }
      if (!data.zoneStatus) {
        errors.push('Zone Status is required');
      }

      if (errors.length !== 0) {
        throw new Error(`Validation errors: ${errors.join('; ')}`)
      }
      return ZoneDao.createZone(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllZones(): Promise<any[]> {
    return ZoneDao.getAllZones();
  }
}

export default new ZoneService();
