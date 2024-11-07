import { PrismaClient, Sensor } from '@prisma/client';
import aws from 'aws-sdk';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import HubDao from '../dao/HubDao';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';
import { ZoneCreateData, ZoneResponseData, ZoneUpdateData } from '../schemas/zoneSchema';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

const prisma = new PrismaClient();

class ZoneService {
  public async createZone(data: ZoneCreateData): Promise<ZoneResponseData> {
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

  public async getAllZones(): Promise<ZoneResponseData[]> {
    const zones = await ZoneDao.getAllZones();
    return this.addParkandHubAndSensorInfo(zones);
  }

  public async getZoneById(id: number): Promise<ZoneResponseData> {
    const zone = await ZoneDao.getZoneById(id);
    const enhancedZone = await this.addParkandHubAndSensorInfo([zone]);
    return enhancedZone[0];
  }

  public async getZonesByParkId(parkId: number): Promise<ZoneResponseData[]> {
    if (parkId) {
      const park = await ParkDao.getParkById(parkId);
      if (!park) {
        throw new Error('Park not found.');
      }
    }
    const zones = await ZoneDao.getZonesByParkId(parkId);
    return this.addParkandHubAndSensorInfo(zones);
  }

  public async deleteZoneById(id: number): Promise<void> {
    const res = await ZoneDao.deleteZoneById(id);
    await prisma.occurrence.deleteMany({
      where: {
        zoneId: id,
      },
    });
    return res;
  }

  public async updateZone(id: number, data: ZoneUpdateData): Promise<ZoneResponseData> {
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

  private async addParkandHubAndSensorInfo(zones: ZoneResponseData[]): Promise<(ZoneResponseData & {
    park: any;
    hubs: any[];
    sensors: Sensor[];
  })[]> {
    return Promise.all(
      zones.map(async (zone) => {
        const park = await ParkDao.getParkById(zone.parkId);
        const hubs = await HubDao.getHubsByZoneId(zone.id);
        const sensors = await Promise.all(
          hubs.map(async (hub) => await HubDao.getAllSensorsByHubId(hub.id))
        );
        return {
          ...zone,
          park,
          hubs,
          sensors: sensors.flat(),
        };
      }),
    );
  }
}

export default new ZoneService();
