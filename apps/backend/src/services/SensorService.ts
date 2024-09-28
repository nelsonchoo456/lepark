import { Prisma, Sensor } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { SensorSchema, SensorSchemaType } from '../schemas/sensorSchema';
import SensorDao from '../dao/SensorDao';
import HubDao from '../dao/HubDao';

import FacilityDao from '../dao/FacilityDao';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

const dateFormatter = (data: any) => {
  const { acquisitionDate, lastCalibratedDate, lastMaintenanceDate, nextMaintenanceDate, ...rest } = data;
  const formattedData = { ...rest };

  // Format dates into JavaScript Date objects
  if (acquisitionDate) formattedData.acquisitionDate = new Date(acquisitionDate);
  if (lastCalibratedDate) formattedData.lastCalibratedDate = new Date(lastCalibratedDate);
  if (lastMaintenanceDate) formattedData.lastMaintenanceDate = new Date(lastMaintenanceDate);
  if (nextMaintenanceDate) formattedData.nextMaintenanceDate = new Date(nextMaintenanceDate);

  return formattedData;
};
function ensureAllFieldsPresent(data: SensorSchemaType): Prisma.SensorCreateInput {
  // Add checks for all required fields
  if (
    !data.sensorName ||
    !data.sensorType ||
    !data.sensorStatus ||
    !data.acquisitionDate ||
    !data.dataFrequencyMinutes ||
    !data.sensorUnit ||
    !data.supplier ||
    data.calibrationFrequencyDays === undefined ||
    !data.supplierContactNumber ||
    !data.serialNumber
  ) {
    throw new Error('Missing required fields for sensor creation');
  }
  return data as Prisma.SensorCreateInput;
}

class SensorService {
  public async createSensor(data: SensorSchemaType): Promise<Sensor> {
    try {
      data.serialNumber = data.serialNumber.trim();
      const checkForExistingSensor = await SensorDao.getSensorBySerialNumber(data.serialNumber);
      if (checkForExistingSensor) {
        throw new Error('Identical sensor serial number already exists.');
      }
      if (data.hubId) {
        const hub = await HubDao.getHubById(data.hubId);
        if (!hub) {
          throw new Error('Hub not found');
        }
      }

      if (data.facilityId) {
        const facility = await FacilityDao.getFacilityById(data.facilityId);
        if (!facility) {
          throw new Error('Facility not found');
        }
      }

      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      SensorSchema.parse(formattedData);

      // Convert validated data to Prisma input type
      const sensorData = ensureAllFieldsPresent(formattedData);

      // Create the sensor, remember to pass in Prisma.SensorCreateInput type
      return SensorDao.createSensor(sensorData);
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

  public async getSensorById(
    id: string,
  ): Promise<Sensor & { hub?: { id: string; name: string }; facility?: { id: string; name: string; parkId?: number } }> {
    const sensor = await SensorDao.getSensorById(id);
    if (!sensor) {
      throw new Error('Sensor not found');
    }

    return sensor;
  }
  public async updateSensor(id: string, data: Partial<SensorSchemaType>): Promise<Sensor> {
    try {
      const formattedData = dateFormatter(data);
      if (formattedData.serialNumber) {
        formattedData.serialNumber = formattedData.serialNumber.trim();
      }
      SensorSchema.partial().parse(formattedData);

      if (formattedData.serialNumber) {
        const checkForExistingSensor = await SensorDao.getSensorBySerialNumber(formattedData.serialNumber);
        if (checkForExistingSensor && checkForExistingSensor.id !== id) {
          throw new Error(`Sensor with serial number ${formattedData.serialNumber} already exists.`);
        }
      }

      const existingSensor = await SensorDao.getSensorById(id);
      if (!existingSensor) {
        throw new Error('Sensor not found');
      }

      if (formattedData.facilityId !== undefined) {
        if (formattedData.facilityId) {
          const facility = await FacilityDao.getFacilityById(formattedData.facilityId);
          if (!facility) {
            throw new Error('Facility not found');
          }
        }
      }

      if (formattedData.hubId !== undefined) {
        if (formattedData.hubId) {
          const hub = await HubDao.getHubById(formattedData.hubId);
          if (!hub) {
            throw new Error('Hub not found');
          }
        }
      }

      const updateData = formattedData as Prisma.SensorUpdateInput;

      const updatedSensor = await SensorDao.updateSensor(id, updateData);

      return updatedSensor;
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

  public async getSensorsByParkId(parkId: number): Promise<Sensor[]> {
    return SensorDao.getSensorsByParkId(parkId);
  }

  public async getSensorsByHubId(hubId: string): Promise<Sensor[]> {
    const hub = await HubDao.getHubById(hubId);
    if (!hub) {
      throw new Error('Hub not found.');
    }
    return SensorDao.getAllSensorsByFacilityId(hub.facilityId);
  }

  public async getSensorsByFacilityId(facilityId: string): Promise<Sensor[]> {
    return SensorDao.getAllSensorsByFacilityId(facilityId);
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
