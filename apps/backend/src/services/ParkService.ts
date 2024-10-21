import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import ParkDao from '../dao/ParkDao';
import { ParkCreateData, ParkUpdateData } from '../schemas/parkSchema';
import aws from 'aws-sdk';
import ZoneDao from '../dao/ZoneDao';

const prisma = new PrismaClient();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

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
      if (!data.geom) {
        errors.push('Zone Boundaries is required');
      }

      if (errors.length !== 0) {
        throw new Error(`Validation errors: ${errors.join('; ')}`)
      }

      // Check if a park with the same name already exists
      const existingPark = await ParkDao.getParkByName(data.name);
      if (existingPark) {
        throw new Error('A park with this name already exists');
      }

      return await ParkDao.createPark(data);
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
      // If the name is being updated, check if it already exists
      if (data.name) {
        const existingPark = await ParkDao.getParkByName(data.name);
        if (existingPark && existingPark.id !== id) {
          throw new Error('A park with this name already exists');
        }
      }

      return ParkDao.updatePark(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async deleteParkById(id: number): Promise<any> {
    const zones = await ZoneDao.getZonesByParkId(id);
    const zoneIds = zones.map(zone => zone.id);

    if (zoneIds.length > 0) {
      await prisma.occurrence.deleteMany({
        where: {
          zoneId: { in: zoneIds },
        },
      });
    }
    
    await prisma.facility.deleteMany({
      where: {
          parkId: id,
      },
    });

    await prisma.attraction.deleteMany({
      where: {
          parkId: id,
      },
    });

    return ParkDao.deleteParkById(id);
  }

  public async getRandomParkImage(): Promise<string[]> {
    return ParkDao.getRandomParkImage();
  }

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
    const params = {
      Bucket: 'lepark',
      Key: `park/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };
    
    try {
      const data = await s3.upload(params).promise();
      // console.log("uploadImageToS3", data)
      return data.Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Error uploading image to S3');
    }
  }
};

const dateFormatter = (data: any) => {
  const { openingHours, closingHours, ...rest } = data;
  const formattedData = { ...rest };

  // Format dateObserved and dateOfBirth into JavaScript Date objects
  const openingHoursFormatted = openingHours.map((h) => h ? new Date(h) : undefined);
  const closingHoursFormatted = closingHours.map((h) => h ? new Date(h) : undefined);

  formattedData.openingHours = openingHoursFormatted;
  formattedData.closingHours = closingHoursFormatted;
  return formattedData;
};//

export default new ParkService();
