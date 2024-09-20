import { Prisma, Sensor } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { SensorSchema, SensorSchemaType } from '../schemas/sensorSchema';
import SensorDao from '../dao/SensorDao';
import HubDao from '../dao/HubDao';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class SensorService {
  public async createSensor(data: SensorSchemaType): Promise<Sensor> {
    try {
      SensorSchema.parse(data);

      if (data.hubId) {
        const hub = await HubDao.getHubById(data.hubId);
        if (!hub) {
          throw new Error('Hub not found.');
        }
      }

      return SensorDao.createSensor(data as Prisma.SensorCreateInput);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllSensors(): Promise<Sensor[]> {
    return SensorDao.getAllSensors();
  }

  public async getSensorById(id: string): Promise<Sensor | null> {
    const sensor = await SensorDao.getSensorById(id);
    if (!sensor) {
      throw new Error('Sensor not found');
    }
    return sensor;
  }

  public async updateSensor(id: string, data: Partial<SensorSchemaType>): Promise<Sensor> {
    try {
      const existingSensor = await this.getSensorById(id);
      const mergedData = { ...existingSensor, ...data };
      SensorSchema.parse(mergedData);

      if (data.hubId && data.hubId !== existingSensor.hubId) {
        const hub = await HubDao.getHubById(data.hubId);
        if (!hub) {
          throw new Error('Hub not found.');
        }
      }

      return SensorDao.updateSensor(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteSensor(id: string): Promise<void> {
    await SensorDao.deleteSensor(id);
  }

  public async getSensorsByHubId(hubId: string): Promise<Sensor[]> {
    const hub = await HubDao.getHubById(hubId);
    if (!hub) {
      throw new Error('Hub not found.');
    }
    return SensorDao.getSensorsByHubId(hubId);
  }

  public async getSensorsByParkId(parkId: number): Promise<Sensor[]> {
    return SensorDao.getSensorsByParkId(parkId);
  }

  public async getSensorsNeedingCalibration(): Promise<Sensor[]> {
    return SensorDao.getSensorsNeedingCalibration();
  }

  public async getSensorsNeedingMaintenance(): Promise<Sensor[]> {
    return SensorDao.getSensorsNeedingMaintenance();
  }

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
    const params = {
      Bucket: 'lepark',
      Key: `sensor/${fileName}`,
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

export default new SensorService();
