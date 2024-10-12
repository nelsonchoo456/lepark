import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ZoneCreateData, ZoneUpdateData } from '../schemas/zoneSchema';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';
import aws from 'aws-sdk';
import HubDao from '../dao/HubDao';

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

      const errors: string[] = [];
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
      if (!data.geom) {
        errors.push('Zone Boundaries is required');
      }

      if (errors.length !== 0) {
        throw new Error(`Validation errors: ${errors.join('; ')}`);
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
    const zones = await ZoneDao.getAllZones();
    return this.addParkandHubAndSensorInfo(zones);
  }

  public async getZoneById(id: number): Promise<any> {
    const zone = await ZoneDao.getZoneById(id);
    console.log('zone', zone);
    return this.addParkandHubAndSensorInfo([zone]);
  }

  public async getZonesByParkId(parkId: number): Promise<any> {
    if (parkId) {
      const park = await ParkDao.getParkById(parkId);
      if (!park) {
        throw new Error('Park not found.');
      }
    }
    const zones = await ZoneDao.getZonesByParkId(parkId);
    return this.addParkandHubAndSensorInfo(zones);
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

  private async addParkandHubAndSensorInfo(zones: any[]): Promise<any[]> {
    return Promise.all(
      zones.map(async (zone) => {
        const park = await ParkDao.getParkById(zone.parkId);
        const hub = await HubDao.getHubByZoneId(zone.id);
        console.log('hub', hub);
        const sensors = await HubDao.getAllSensorsByHubId(hub?.id);
        // console.log("sensors", sensors)
        return {
          ...zone,
          park,
          hub,
          sensors,
        };
      }),
    );
  }
}

export default new ZoneService();
