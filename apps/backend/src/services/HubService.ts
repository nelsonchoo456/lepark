import aws from 'aws-sdk';
import { HubSchemaType, HubSchema } from '../schemas/hubSchema';
import HubDao from '../dao/HubDao';
import { Prisma, Hub, Facility, SensorReading, Sensor } from '@prisma/client';
import { z } from 'zod';
import FacilityDao from '../dao/FacilityDao';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';
import { ZoneResponseData } from '../schemas/zoneSchema';
import { ParkResponseData } from '../schemas/parkSchema';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { SensorReadingSchema, SensorReadingSchemaType } from '../schemas/sensorReadingSchema';
import { fromZodError } from 'zod-validation-error';
import SensorReadingDao from '../dao/SensorReadingDao';
import SensorDao from '../dao/SensorDao';

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
  if (lastMaintenanceDate) {
    formattedData.lastMaintenanceDate = new Date(lastMaintenanceDate);
  }
  if (nextMaintenanceDate) {
    formattedData.nextMaintenanceDate = new Date(nextMaintenanceDate);
  }
  return formattedData;
};

export class HubNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HubNotFoundError';
  }
}

export class HubNotActiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HubNotActiveError';
  }
}

class HubService {
  public async createHub(data: HubSchemaType): Promise<Hub> {
    try {
      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      HubSchema.parse(formattedData);

      // Ensure all fields are present and convert to Prisma input type
      const hubData = ensureAllFieldsPresent(formattedData);

      hubData.identifierNumber = this.generateIdentifierNumber();

      let existingHub = await HubDao.getHubByIdentifierNumber(hubData.identifierNumber);

      while (existingHub) {
        hubData.identifierNumber = this.generateIdentifierNumber();
        existingHub = await HubDao.getHubByIdentifierNumber(hubData.identifierNumber);
      }

      // Validate serialNumber uniqueness
      if (hubData.serialNumber) {
        const isDuplicate = await this.isSerialNumberDuplicate(hubData.serialNumber);
        if (isDuplicate) {
          throw new Error(`Hub with serial number ${hubData.serialNumber} already exists.`);
        }
      }

      // Create the hub
      return HubDao.createHub(hubData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllHubs(): Promise<(Hub & { facility?: Facility; park?: ParkResponseData; zone?: ZoneResponseData })[]> {
    return HubDao.getAllHubs();
  }

  public async getHubsByParkId(parkId: number): Promise<Hub[]> {
    return HubDao.getHubsByParkId(parkId);
  }

  public async getHubById(id: string): Promise<(Hub & { facility: Facility; zone?: ZoneResponseData; park: ParkResponseData }) | null> {
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
      return { ...hub, facility: facility, zone: zone, park: park };
    } else {
      return { ...hub, facility: facility, park: park };
    }
  }

  public async updateHubDetails(id: string, data: Partial<HubSchemaType>): Promise<Hub> {
    try {
      const formattedData = dateFormatter(data);
      if (formattedData.identifierNumber) {
        formattedData.identifierNumber = formattedData.identifierNumber.trim();
      }
      if (formattedData.serialNumber) {
        formattedData.serialNumber = formattedData.serialNumber.trim();
      }
      HubSchema.partial().parse(formattedData);

      if (formattedData.identifierNumber) {
        const checkForExistingHub = await HubDao.getHubByIdentifierNumber(formattedData.identifierNumber);
        if (checkForExistingHub && checkForExistingHub.id !== id) {
          throw new Error(`Hub with identifier number ${formattedData.identifierNumber} already exists.`);
        }
      }

      if (formattedData.serialNumber) {
        const isDuplicate = await this.isSerialNumberDuplicate(formattedData.serialNumber, id);
        if (isDuplicate) {
          throw new Error(`Hub with serial number ${formattedData.serialNumber} already exists.`);
        }
      }

      const updateData = formattedData as Prisma.HubUpdateInput;
      console.log('updateDataHEREEEEEEEE', updateData);
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

  public async isSerialNumberDuplicate(serialNumber: string, excludeHubId?: string): Promise<boolean> {
    return HubDao.isSerialNumberDuplicate(serialNumber, excludeHubId);
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

  public async addHubToZone(id: string, data: Partial<HubSchemaType>): Promise<Hub> {
    try {
      const formattedData = dateFormatter(data);

      HubSchema.partial().parse(formattedData);
      const hub = await HubDao.getHubById(id);

      if (formattedData.zoneId) {
        const zone = await ZoneDao.getZoneById(formattedData.zoneId);
        if (!zone) {
          throw new Error('Zone not found');
        }
      }

      if (hub.zoneId) {
        throw new Error('Hub already has a zone');
      }

      if (hub.hubStatus !== 'INACTIVE') {
        throw new Error('Hub must be inactive to be added to a zone');
      }

      if (hub.radioGroup) {
        throw new Error('Hub already has a radio group');
      }

      if (hub.hubSecret) {
        throw new Error('Hub already has a hub secret');
      }

      const generatedHubSecret = this.generateHubSecret();
      const generatedRadioGroup = this.generateRandomRadioGroup();

      // Add hubSecret and radioGroup to formattedData
      formattedData.hubSecret = generatedHubSecret;
      formattedData.radioGroup = generatedRadioGroup;

      const updateData = formattedData as Prisma.HubUpdateInput;
      console.log('updateDataHEREEEEEEEE', updateData);
      return HubDao.updateHubDetails(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  // Verify hub initialization when raspberry pi first boots up
  public async verifyHubInitialization(identifierNumber: string, ipAddress: string): Promise<string> {
    const hub = await HubDao.getHubByIdentifierNumber(identifierNumber);

    if (!hub) {
      throw new HubNotFoundError('Hub not found');
    }

    if (hub.hubStatus !== 'INACTIVE') {
      throw new HubNotActiveError('Hub is already active');
    }

    if (!hub.zoneId) {
      throw new Error('Hub must be in a zone to be initialized');
    }

    await HubDao.updateHubDetails(hub.id, { 
      ipAddress: ipAddress,
      hubStatus: 'ACTIVE'
    });

    return hub.hubSecret;
  }

  public async getAllSensorsByHubId(hubId: string): Promise<Sensor[]> {
    return HubDao.getAllSensorsByHubId(hubId);
  }

  public generateHubSecret(): string {
    return (Math.random() + 1).toString(36).substring(7) + (Math.random() + 1).toString(36).substring(7);
  }

  public generateRandomRadioGroup(): number {
    return Math.floor(Math.random() * 255);
  }

  public async validatePayload(hubId: string, jsonPayload: string, sha256: string): Promise<boolean> {
    const hub = await HubDao.getHubById(hubId);
    if (!hub || !hub.hubSecret) {
      throw new Error('Hub not found or hub secret not set');
    }
    const calculatedHash = this.calculateHash(jsonPayload + hub.hubSecret);
    return sha256 === calculatedHash;
  }

  private calculateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public async updateHubSecret(hubId: string): Promise<Hub> {
    const newSecret = this.generateHubSecret();
    return HubDao.updateHubDetails(hubId, { hubSecret: newSecret });
  }

  private generateIdentifierNumber(): string {
    return `HUB-${uuidv4().substr(0, 8).toUpperCase()}`;
  }

  public async pushSensorReadings(
    hubId: string,
    jsonPayloadString: string,
    sha256: string,
    ipAddress: string,
  ): Promise<{ sensors: string[]; radioGroup: number }> {
    const hub = await HubDao.getHubById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }

    if (!(await this.validatePayload(hubId, jsonPayloadString, sha256))) {
      throw new Error('JSON validation failed. Digest does not match!');
    }

    const payload = JSON.parse(jsonPayloadString);

    for (const sensorId of Object.keys(payload)) {
      for (const sensorReading of payload[sensorId]) {
        const sensor = await SensorDao.getSensorById(sensorId);
        if (!sensor) {
          throw new Error('Sensor not found');
        }
        await SensorReadingDao.createSensorReading({
          date: new Date(sensorReading.readingDate),
          value: sensorReading.reading,
          sensor: { connect: { id: sensor.id } },
        });
      }
    }

    // Update hub's last data update and IP address
    await HubDao.updateHubDetails(hubId, {
      ipAddress,
    });

    const sensors = await HubDao.getAllSensorsByHubId(hubId);
    return {
      sensors: sensors.map((sensor) => sensor.name),
      radioGroup: hub.radioGroup,
    };
  }
}

function ensureAllFieldsPresent(data: HubSchemaType): Prisma.HubCreateInput {
  // Add checks for all required fields
  if (
    !data.name ||
    !data.hubStatus ||
    !data.acquisitionDate ||
    !data.supplier ||
    !data.supplierContactNumber ||
    !data.serialNumber ||
    !data.facilityId
  ) {
    throw new Error('Missing required fields for hub creation');
  }
  return data as Prisma.HubCreateInput;
}

export default new HubService();
