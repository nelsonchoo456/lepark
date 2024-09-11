import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import ParkDao from '../dao/ParkDao';
import { ParkCreateData, ParkUpdateData } from '../schemas/parkSchema';

class ParkService {
  public async createPark(data: ParkCreateData): Promise<any> {
    try {
      const errors: string[] = []
      if (!data.name || data.name.length < 3) {
        errors.push('Valid name is required');
      }
      if (!data.address || data.address.length < 3) {
        errors.push('Address is required');
      }
      if (!data.contactNumber || data.contactNumber.length < 3) {
        errors.push('Address is required');
      }
      if (!data.openingHours || data.openingHours.length != 7) {
        errors.push('Opening Hours are required');
      }
      if (!data.closingHours || data.closingHours.length != 7) {
        errors.push('Closing Hours are required');
      }
      if (!data.parkStatus) {
        errors.push('Park Status is required');
      }

      if (errors.length !== 0) {
        throw new Error(`Validation errors: ${errors.join('; ')}`)
      }
      return ParkDao.createPark(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllParks(): Promise<any[]> {
    return ParkDao.getAllParks();
  }

  public async getParkById(id: number): Promise<any> {
    return ParkDao.getParkById(id);
  }

  public async updatePark(id: number, data: ParkUpdateData): Promise<any> {
    try {
      return ParkDao.updatePark(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }
};

const dateFormatter = (data: any) => {
  const { dateObserved, dateOfBirth, ...rest } = data;
  const formattedData = { ...rest };

  // Format dateObserved and dateOfBirth into JavaScript Date objects
  const dateObservedFormat = dateOfBirth ? new Date(dateObserved) : undefined;
  const dateOfBirthFormat = dateOfBirth ? new Date(dateOfBirth) : undefined;
  if (dateObserved) {
    formattedData.dateObserved = dateObservedFormat;
  }
  if (dateOfBirth) {
    formattedData.dateOfBirth = dateOfBirthFormat;
  }
  return formattedData;
};//

export default new ParkService();