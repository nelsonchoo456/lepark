import { HubSchemaType, HubSchema } from '../schemas/hubSchema';
import HubDao from '../dao/HubDao';
import { Prisma, Hub } from '@prisma/client';
import { z } from 'zod';

const dateFormatter = (data: any) => {
  const { acquisitionDate, lastCalibratedDate, lastMaintenanceDate, nextMaintenanceDate, ...rest } = data;
  const formattedData = { ...rest };

  // Format date fields into JavaScript Date objects
  if (acquisitionDate) {
    formattedData.acquisitionDate = new Date(acquisitionDate);
  }
  if (lastCalibratedDate) {
    formattedData.lastCalibratedDate = new Date(lastCalibratedDate);
  }
  if (lastMaintenanceDate) {
    formattedData.lastMaintenanceDate = new Date(lastMaintenanceDate);
  }
  if (nextMaintenanceDate) {
    formattedData.nextMaintenanceDate = new Date(nextMaintenanceDate);
  }
  return formattedData;
};

class HubService {
  public async createHub(data: HubSchemaType): Promise<Hub> {
    try {
      // Format date fields
      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      HubSchema.parse(formattedData);

      // Check for duplicate serialNumber
      const existingHub = await HubDao.getHubBySerialNumber(formattedData.serialNumber);
      if (existingHub) {
        throw new Error(`Hub with serial number ${formattedData.serialNumber} already exists.`);
      }

      // Convert validated data to Prisma input type
      const hubData = formattedData as Prisma.HubCreateInput;

      // Create the hub
      return HubDao.createHub(hubData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public async getAllHubs(): Promise<Hub[]> {
    return HubDao.getAllHubs();
  }

  public async getHubById(id: string): Promise<Hub | null> {
    return HubDao.getHubById(id);
  }

  public async updateHubDetails(id: string, data: Partial<HubSchemaType>): Promise<Hub> {
    try {
      // Format date fields
      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      HubSchema.partial().parse(formattedData);

      // Check for duplicate serialNumber if serialNumber is being updated
      if (formattedData.serialNumber) {
        const existingHub = await HubDao.getHubBySerialNumber(formattedData.serialNumber);
        if (existingHub && existingHub.id !== id) {
          throw new Error(`Hub with serial number ${formattedData.serialNumber} already exists.`);
        }
      }

      // Convert validated data to Prisma input type
      const updateData = formattedData as Prisma.HubUpdateInput;

      // Update the hub
      return HubDao.updateHubDetails(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public async deleteHub(id: string): Promise<void> {
    await HubDao.deleteHub(id);
  }
}

export default new HubService();
