import aws from 'aws-sdk';
import { HubSchemaType, HubSchema } from '../schemas/hubSchema';
import HubDao from '../dao/HubDao';
import { Prisma, Hub, Facility, Sensor } from '@prisma/client';
import { z } from 'zod';
import FacilityDao from '../dao/FacilityDao';
import ParkDao from '../dao/ParkDao';
import ZoneDao from '../dao/ZoneDao';
import { ZoneResponseData } from '../schemas/zoneSchema';
import { ParkResponseData } from '../schemas/parkSchema';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { fromZodError } from 'zod-validation-error';
import SensorReadingDao from '../dao/SensorReadingDao';
import SensorDao from '../dao/SensorDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

const dateFormatter = (data: any) => {
  const { acquisitionDate, lastMaintenanceDate, nextMaintenanceDate, ...rest } = data;
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
      formattedData.hubStatus = "INACTIVE";
      
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

  public async getHubsFiltered(hubStatus: string, parkId: number): Promise<(Hub & { facility?: Facility; park?: ParkResponseData; zone?: ZoneResponseData })[]> {
    return HubDao.getHubsFiltered(hubStatus, parkId);
  }

  public async getHubsByParkId(parkId: number): Promise<Hub[]> {
    return HubDao.getHubsByParkId(parkId);
  }

  public async getHubByIdentifierNumber(identifierNumber: string): Promise<Hub | null> {
    return HubDao.getHubByIdentifierNumber(identifierNumber);
  }

  public async getHubByRadioGroup(radioGroup: number): Promise<Hub | null> {
    return HubDao.getHubByRadioGroup(radioGroup);
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

  // Update hub's zone, dataTransmissionInterval, macAddress, lat, long, remarks (if any)
  public async addHubToZone(id: string, data: Partial<HubSchemaType>): Promise<Hub> {
    try {
      const hub = await HubDao.getHubById(id);

      if (!hub) {
        throw new HubNotFoundError('Hub not found');
      }

      const formattedData = dateFormatter(data);

      HubSchema.partial().parse(formattedData);

      if (formattedData.zoneId) {
        const zone = await ZoneDao.getZoneById(formattedData.zoneId);
        if (!zone) {
          throw new Error('Zone not found');
        }

        // Check if the zone already has a hub
        const existingHubInZone = await HubDao.getHubByZoneId(formattedData.zoneId);
        if (existingHubInZone) {
          throw new Error('Zone already has a hub assigned');
        }
      }

      const zone = await ZoneDao.getZoneById(formattedData.zoneId);
      const hubFacility = await FacilityDao.getFacilityById(hub.facilityId);
      if (hubFacility.parkId !== zone.parkId) {
        throw new Error('Hub and zone are in different parks');
      }

      if (hub.zoneId) {
        throw new Error('Hub already has a zone');
      }

      if (hub.hubStatus === 'ACTIVE') {
        throw new Error('Hub must be inactive to be added to a zone');
      } else if (hub.hubStatus === 'DECOMMISSIONED') {
        throw new Error('Hub is decommissioned. It cannot be used.');
      } else if (hub.hubStatus === 'UNDER_MAINTENANCE') {
        throw new Error('Hub is under maintenance. It cannot be used.');
      }

      if (hub.radioGroup) {
        throw new Error('Hub already has a radio group');
      }

      if (hub.hubSecret) {
        throw new Error('Hub already has a hub secret');
      }

      formattedData.hubStatus = 'ACTIVE';

      const updateData = formattedData as Prisma.HubUpdateInput;
      return HubDao.updateHubDetails(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async removeHubFromZone(id: string): Promise<Hub> {
    try {
      const hub = await HubDao.getHubById(id);

      if (!hub) {
        throw new HubNotFoundError('Hub not found');
      }

      if (!hub.zoneId) {
        throw new Error('Hub is not assigned to any zone');
      }

      if (hub.hubStatus !== 'ACTIVE') {
        throw new Error('Hub must be active to be removed from a zone');
      }

      if (await HubDao.doesHubHaveSensors(hub.id)) {
        throw new Error('Hub has sensors assigned to it. Remove the sensors first.');
      }

      const updateData: Prisma.HubUpdateInput = {
        zoneId: null,
        hubStatus: 'INACTIVE',
        radioGroup: null,
        hubSecret: null,
        ipAddress: null,
        dataTransmissionInterval: null,
        macAddress: null,
        lat: null,
        long: null,
        remarks: null,
      };

      return HubDao.updateHubDetails(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
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

    if (!hub.zoneId) {
      throw new Error('Hub must be in a zone to be initialized');
    }

    if (hub.hubStatus === 'INACTIVE') {
      throw new HubNotActiveError('Hub is inactive. It must be active to be initialized.');
    } else if (hub.hubStatus === 'DECOMMISSIONED') {
      throw new Error('Hub is decommissioned. It cannot be used.');
    } else if (hub.hubStatus === 'UNDER_MAINTENANCE') {
      throw new Error('Hub is under maintenance. It cannot be used.');
    }

    const generatedHubSecret = this.generateHubSecret();
    let generatedRadioGroup = this.generateRandomRadioGroup();

    while (await this.getHubByRadioGroup(generatedRadioGroup)) {
      generatedRadioGroup = this.generateRandomRadioGroup();
    }

    await HubDao.updateHubDetails(hub.id, {
      ipAddress: ipAddress,
      hubStatus: 'ACTIVE',
      hubSecret: generatedHubSecret,
      radioGroup: generatedRadioGroup,
    });

    return generatedHubSecret;
  }

  public async pushSensorReadings(
    hubIdentifierNumber: string,
    jsonPayloadString: string,
    sha256: string,
    ipAddress: string,
  ): Promise<{ sensors: string[]; radioGroup: number }> {
    try {
      const hub = await HubDao.getHubByIdentifierNumber(hubIdentifierNumber);
      if (!hub) {
        throw new HubNotFoundError(`Hub with identifier number ${hubIdentifierNumber} not found`);
      }

      if (!hub.hubSecret) {
        throw new Error(`Hub secret not set for hub with identifier number ${hubIdentifierNumber}`);
      }

      if (!(await this.validatePayload(hub.id, jsonPayloadString, sha256))) {
        throw new Error('JSON validation failed. Digest does not match!');
      }

      const payload = JSON.parse(jsonPayloadString);
      console.log('payload', payload);

      for (const sensorIdentifier of Object.keys(payload)) {
        for (const sensorData of payload[sensorIdentifier]) {
          const sensor = await SensorDao.getSensorByIdentifierNumber(sensorIdentifier);
          if (!sensor) {
            throw new Error('Sensor not found');
          }

          await SensorReadingDao.createSensorReading({
            date: new Date(sensorData.readingDate),
            value: sensorData.reading,
            sensor: { connect: { id: sensor.id } },
          });
        }
      }

      // Update hub's last data update and IP address
      await HubDao.updateHubDetails(hub.id, {
        ipAddress,
        lastDataUpdateDate: new Date(),
      });

      // After processing the sensor readings, update the list of sensors
      const updatedSensors = await this.updateHubSensors(hubIdentifierNumber);

      console.log('Finished pushing sensor readings');
      return {
        sensors: updatedSensors,
        radioGroup: hub.radioGroup,
      };
    } catch (error) {
      console.error('Error pushing sensor readings:', error);
      throw error;
    }
  }

  public async getAllSensorsByHubId(hubId: string): Promise<Sensor[]> {
    return HubDao.getAllSensorsByHubId(hubId);
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

  public async isSerialNumberDuplicate(serialNumber: string, excludeHubId?: string): Promise<boolean> {
    return HubDao.isSerialNumberDuplicate(serialNumber, excludeHubId);
  }

  public generateHubSecret(): string {
    return (Math.random() + 1).toString(36).substring(7) + (Math.random() + 1).toString(36).substring(7);
  }

  public generateRandomRadioGroup(): number {
    return Math.floor(Math.random() * 255); // 0 - 254, 255 is not available as it is used for Micro:bits with unconfigured radio groups
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
    return `HB-${uuidv4().substr(0, 5).toUpperCase()}`;
  }

  public async updateHubSensors(hubIdentifierNumber: string): Promise<string[]> {
    const hub = await HubDao.getHubByIdentifierNumber(hubIdentifierNumber);
    if (!hub) {
      throw new HubNotFoundError('Hub not found');
    }

    const sensors = await this.getAllSensorsByHubId(hub.id);
    return sensors.map((sensor) => sensor.identifierNumber);
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
