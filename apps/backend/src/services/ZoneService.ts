import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ZoneCreateData, ZoneUpdateData } from '../schemas/zoneSchema';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

const prisma = new PrismaClient();

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

  public async getZoneById(id: number): Promise<any> {
    return ZoneDao.getZoneById(id);
  }

  public async getZonesByParkId(parkId: number): Promise<any> {
    if (parkId) {
      const park = await ParkDao.getParkById(parkId);
      if (!park) {
        throw new Error('Park not found.');
      }
    }
    return ZoneDao.getZonesByParkId(parkId);
  }

  public async deleteZoneById(id: number): Promise<any> {
    const res = await ZoneDao.deleteZoneById(id);
    await prisma.occurrence.deleteMany({
      where: {
        zoneId: id,
      },
    });
    return res;
  }

  public async updateZone(id: number, data: ZoneUpdateData): Promise<any> {
    try {
      if (data.parkId) {
        const park = await ParkDao.getParkById(data.parkId);
        if (!park) {
          throw new Error('Park not found.');
        }
      }

      return ZoneDao.updateZone(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async uploadImageToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `zone/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };
    
    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Error uploading image to S3');
    }
  }
}

export default new ZoneService();
