import aws from 'aws-sdk';
import { HubSchemaType, HubSchema } from '../schemas/hubSchema';
import HubDao from '../dao/HubDao';
import { Prisma, Hub } from '@prisma/client';
import { z } from 'zod';
import FacilityDao from '../dao/FacilityDao';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

const dateFormatter = (data: any) => {
  const { acquisitionDate, lastCalibratedDate, lastMaintenanceDate, nextMaintenanceDate, ...rest } = data;
  const formattedData = { ...rest };

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
      const formattedData = dateFormatter(data);
      if (formattedData.serialNumber) {
        formattedData.serialNumber = formattedData.serialNumber.trim();
      }
      HubSchema.parse(formattedData);

      const existingHub = await HubDao.getHubBySerialNumber(formattedData.serialNumber);
      if (existingHub) {
        throw new Error(`Hub with serial number ${formattedData.serialNumber} already exists.`);
      }

      const hubData = formattedData as Prisma.HubCreateInput;
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

  public async getHubsByParkId(parkId: number): Promise<Hub[]> {
    return HubDao.getHubsByParkId(parkId);
  }

  public async getHubById(id: string): Promise<(Hub & { facilityName: string; zoneName?: string; parkName: string }) | null> {
    const hub = await HubDao.getHubById(id);
    if (!hub) {
      throw new Error('Hub not found');
    }

    const facility = await FacilityDao.getFacilityById(hub.facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }

    const park = await ParkDao.getParkById(facility.parkId);
    if (!park) {
      throw new Error('Park not found');
    }

    if (hub.zoneId) {
      const zone = await ZoneDao.getZoneById(hub.zoneId);
      if (!zone) {
        throw new Error('Zone not found');
      }
      return { ...hub, facilityName: facility.name, zoneName: zone.name, parkName: park.name };
    } else {
      return { ...hub, facilityName: facility.name, parkName: park.name };
    }
  }

  public async updateHubDetails(id: string, data: Partial<HubSchemaType>): Promise<Hub> {
    try {
      const formattedData = dateFormatter(data);
      if (formattedData.serialNumber) {
        formattedData.serialNumber = formattedData.serialNumber.trim();
      }
      HubSchema.partial().parse(formattedData);

      if (formattedData.serialNumber) {
        const existingHub = await HubDao.getHubBySerialNumber(formattedData.serialNumber);
        if (existingHub && existingHub.id !== id) {
          throw new Error(`Hub with serial number ${formattedData.serialNumber} already exists.`);
        }
      }

      const updateData = formattedData as Prisma.HubUpdateInput;
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

  public async uploadImageToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `hub/${fileName}`,
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

export default new HubService();
