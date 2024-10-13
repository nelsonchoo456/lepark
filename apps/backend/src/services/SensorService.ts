import { Facility, Hub, Prisma, Sensor } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { SensorSchema, SensorSchemaType } from '../schemas/sensorSchema';
import SensorDao from '../dao/SensorDao';
import HubDao from '../dao/HubDao';

import FacilityDao from '../dao/FacilityDao';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import ParkDao from '../dao/ParkDao';
import { ParkResponseData } from '../schemas/parkSchema';
import { HubNotFoundError } from './HubService';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class SensorService {
  public async createSensor(data: SensorSchemaType): Promise<Sensor> {
    try {
      if (data.facilityId) {
        const facility = await FacilityDao.getFacilityById(data.facilityId);
        if (!facility) {
          throw new Error('Facility not found');
        }
      }

      const formattedData = dateFormatter(data);
      formattedData.sensorStatus = "INACTIVE";
      
      // Validate input data using Zod
      SensorSchema.parse(formattedData);

      // Convert validated data to Prisma input type
      const sensorData = ensureAllFieldsPresent(formattedData);

      sensorData.identifierNumber = this.generateIdentifierNumber();

      let existingSensor = await SensorDao.getSensorByIdentifierNumber(sensorData.identifierNumber);

      while (existingSensor) {
        sensorData.identifierNumber = this.generateIdentifierNumber();
        existingSensor = await SensorDao.getSensorByIdentifierNumber(sensorData.identifierNumber);
      }

      // Validate serialNumber uniqueness
      if (sensorData.serialNumber) {
        const isDuplicate = await this.isSerialNumberDuplicate(sensorData.serialNumber);
        if (isDuplicate) {
          throw new Error(`Sensor with serial number ${sensorData.serialNumber} already exists.`);
        }
      }

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
  public async getAllSensors(): Promise<
    (Sensor & {
      hub?: { id: string; name: string; facilityId: string };
      facility?: { id: string; name: string; parkId: number };
      park?: ParkResponseData;
    })[]
  > {
    return SensorDao.getAllSensors();
  }

  public async getSensorById(id: string): Promise<Sensor & { hub?: Hub; facility?: Facility; park?: ParkResponseData }> {
    const sensor = await SensorDao.getSensorById(id);
    if (!sensor) {
      throw new Error('Sensor not found');
    }

    const facility = await FacilityDao.getFacilityById(sensor.facilityId);
    if (!facility) {
      throw new Error('Facility not found');
    }
    const park = await ParkDao.getParkById(facility.parkId);
    if (!park) {
      throw new Error('Park not found');
    }

    if (sensor.hubId) {
      const hub = await HubDao.getHubById(sensor.hubId);
      if (!hub) {
        throw new Error('Hub not found');
      }
      return { ...sensor, hub: hub, facility: facility, park: park };
    }

    return { ...sensor, facility: facility, park: park };
  }

  public async updateSensor(id: string, data: Partial<SensorSchemaType>): Promise<Sensor> {
    try {
      const formattedData = dateFormatter(data);
      if (formattedData.identifierNumber) {
        formattedData.identifierNumber = formattedData.identifierNumber.trim();
      }
      if (formattedData.serialNumber) {
        formattedData.serialNumber = formattedData.serialNumber.trim();
      }
      SensorSchema.partial().parse(formattedData);

      if (formattedData.identifierNumber) {
        const checkForExistingSensor = await SensorDao.getSensorByIdentifierNumber(formattedData.identifierNumber);
        if (checkForExistingSensor && checkForExistingSensor.id !== id) {
          throw new Error(`Sensor with identifier number ${formattedData.identifierNumber} already exists.`);
        }
      }

      if (formattedData.serialNumber) {
        const isDuplicate = await this.isSerialNumberDuplicate(formattedData.serialNumber, id);
        if (isDuplicate) {
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

  public async getSensorsByZoneId(zoneId: number): Promise<Sensor[]> {
    return SensorDao.getSensorsByZoneId(zoneId);
  }

  public async getSensorsByFacilityId(facilityId: string): Promise<Sensor[]> {
    return SensorDao.getAllSensorsByFacilityId(facilityId);
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

  public async getSensorByIdentifierNumber(identifierNumber: string): Promise<Sensor | null> {
    return SensorDao.getSensorByIdentifierNumber(identifierNumber);
  }

  public async getSensorBySerialNumber(serialNumber: string): Promise<Sensor | null> {
    return SensorDao.getSensorBySerialNumber(serialNumber);
  }

  // Update sensor's hubId, lat, long, remarks (if any)
  public async addSensorToHub(id: string, data: Partial<SensorSchemaType>): Promise<Sensor> {
    try {
      const sensor = await SensorDao.getSensorById(id);
      if (!sensor) {
        throw new Error('Sensor not found');
      }

      const formattedData = dateFormatter(data);
      SensorSchema.partial().parse(formattedData);
      console.log(formattedData);

      if (!formattedData.hubId) {
        throw new Error('Hub ID is required');
      }

      const hub = await HubDao.getHubById(formattedData.hubId);
      if (!hub) {
        throw new Error(`Hub with ID ${formattedData.hubId} not found`);
      }

      const hubFacility = await FacilityDao.getFacilityById(hub.facilityId);
      if (!hubFacility) {
        throw new Error(`Facility for hub ${hub.id} not found`);
      }

      const sensorFacility = await FacilityDao.getFacilityById(sensor.facilityId);
      if (!sensorFacility) {
        throw new Error(`Facility for sensor ${sensor.id} not found`);
      }

      if (hubFacility.parkId !== sensorFacility.parkId) {
        throw new Error('Sensor and hub are in different parks');
      }

      if (sensor.hubId) {
        throw new Error('Sensor is already assigned to a hub');
      }

      if (sensor.sensorStatus === 'ACTIVE') {
        throw new Error('Sensor is already active');
      } else if (sensor.sensorStatus === 'DECOMMISSIONED') {
        throw new Error('Sensor is decommissioned. It cannot be used.');
      } else if (sensor.sensorStatus === 'UNDER_MAINTENANCE') {
        throw new Error('Sensor is under maintenance. It cannot be used.');
      }

      if (hub.hubStatus === 'INACTIVE') {
        throw new Error('Hub is currently inactive. It must be active to add sensors.');
      } else if (hub.hubStatus === 'DECOMMISSIONED') {
        throw new Error('Hub is decommissioned. It cannot be used.');
      } else if (hub.hubStatus === 'UNDER_MAINTENANCE') {
        throw new Error('Hub is under maintenance. It cannot be used.');
      }

      if (!hub.zoneId) {
        throw new Error('Hub is not assigned to a zone. It must be assigned to a zone to add sensors.');
      }

      if (sensor.hubId) {
        throw new Error('Sensor is already assigned to a hub');
      }

      formattedData.sensorStatus = 'ACTIVE';

      const updateData = formattedData as Prisma.SensorUpdateInput;
      return SensorDao.updateSensor(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async removeSensorFromHub(id: string): Promise<Sensor> {
    try {
      const sensor = await SensorDao.getSensorById(id);

      if (!sensor) {
        throw new Error('Sensor not found');
      }

      if (!sensor.hubId) {
        throw new Error('Sensor is not assigned to any hub');
      }

      if (sensor.sensorStatus !== 'ACTIVE') {
        throw new Error('Sensor must be active to be removed from a hub');
      }

      const updateData: Prisma.SensorUpdateInput = {
        hub: {
          disconnect: true,
        },
        sensorStatus: 'INACTIVE',
        lat: null,
        long: null,
        remarks: null,
      };

      return SensorDao.updateSensor(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  private generateIdentifierNumber(): string {
    return `SE-${uuidv4().substr(0, 5).toUpperCase()}`;
  }

  public async isSerialNumberDuplicate(serialNumber: string, excludeSensorId?: string): Promise<boolean> {
    return SensorDao.isSerialNumberDuplicate(serialNumber, excludeSensorId);
  }
}

const dateFormatter = (data: any) => {
  const { acquisitionDate, lastMaintenanceDate, nextMaintenanceDate, ...rest } = data;
  const formattedData = { ...rest };

  // Format dates into JavaScript Date objects
  if (acquisitionDate) formattedData.acquisitionDate = new Date(acquisitionDate);
  if (lastMaintenanceDate) formattedData.lastMaintenanceDate = new Date(lastMaintenanceDate);
  if (nextMaintenanceDate) formattedData.nextMaintenanceDate = new Date(nextMaintenanceDate);

  return formattedData;
};
function ensureAllFieldsPresent(data: SensorSchemaType): Prisma.SensorCreateInput {
  // Add checks for all required fields
  if (
    !data.name ||
    !data.sensorType ||
    !data.sensorStatus ||
    !data.acquisitionDate ||
    !data.sensorUnit ||
    !data.supplier ||
    !data.supplierContactNumber
  ) {
    throw new Error('Missing required fields for sensor creation');
  }
  return data as Prisma.SensorCreateInput;
}

export default new SensorService();
