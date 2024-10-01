import { Prisma, ParkAsset, ParkAssetStatusEnum, ParkAssetTypeEnum } from '@prisma/client';
import { z } from 'zod';
import { ParkAssetSchema, ParkAssetSchemaType } from '../schemas/parkAssetSchema';
import ParkAssetDao from '../dao/ParkAssetDao';
import FacilityDao from '../dao/FacilityDao';
import { fromZodError } from 'zod-validation-error';
import aws from 'aws-sdk';
import ParkDao from '../dao/ParkDao';
import { ParkResponse } from '@lepark/data-access';
import { ParkResponseData } from '../schemas/parkSchema';
import { v4 as uuidv4 } from 'uuid';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class ParkAssetService {
  public async createParkAsset(data: ParkAssetSchemaType): Promise<ParkAsset> {
    try {
      if (data.facilityId) {
        const facility = await FacilityDao.getFacilityById(data.facilityId);
        if (!facility) {
          throw new Error('Facility not found');
        }
      }
      const formattedData = dateFormatter(data);
      ParkAssetSchema.parse(formattedData);
      const parkAssetData = ensureAllFieldsPresent(formattedData);
      
      // Generate a unique identifierNumber based on the asset type
      parkAssetData.identifierNumber = this.generateIdentifierNumber(parkAssetData.parkAssetType);

      let existingAsset = await ParkAssetDao.getParkAssetByIdentifierNumber(parkAssetData.identifierNumber);

      while (existingAsset) {
        parkAssetData.identifierNumber = this.generateIdentifierNumber(parkAssetData.parkAssetType);
        existingAsset = await ParkAssetDao.getParkAssetByIdentifierNumber(parkAssetData.identifierNumber);
      }

      // Validate serialNumber uniqueness
      if (parkAssetData.serialNumber) {
        const existingAssetWithSerialNumber = await ParkAssetDao.getParkAssetBySerialNumber(parkAssetData.serialNumber);
        if (existingAssetWithSerialNumber) {
          throw new Error(`Park asset with serial number ${parkAssetData.serialNumber} already exists.`);
        }
      }

      return ParkAssetDao.createParkAsset(parkAssetData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`${fromZodError(error).message}`);
      }
      throw error;
    }
  }

  public async getAllParkAssets(): Promise<ParkAsset[]> {
    return ParkAssetDao.getAllParkAssets();
  }

  public async getAllParkAssetsByParkId(parkId: number): Promise<ParkAsset[]> {
    return ParkAssetDao.getAllParkAssetsByParkId(parkId);
  }

  public async getParkAssetById(id: string): Promise<(ParkAsset & { parkName: string }) | null> {
    const parkAsset = await ParkAssetDao.getParkAssetById(id);
    if (!parkAsset) return null;

    const facility = await FacilityDao.getFacilityById(parkAsset.facilityId);
    if (!facility) return null;

    const park = await ParkDao.getParkById(facility.parkId);
    if (!park) return null;

    return { ...parkAsset, parkName: park.name };
  }

  public async updateParkAsset(id: string, data: Partial<ParkAssetSchemaType>): Promise<ParkAsset> {
    try {
      const existingAsset = await ParkAssetDao.getParkAssetById(id);
      if (!existingAsset) throw new Error('Park asset not found');

      if (data.facilityId) {
        const facility = await FacilityDao.getFacilityById(data.facilityId);
        if (!facility) {
          throw new Error('Facility not found');
        }
      }

      const formattedData = dateFormatter(data);
      let mergedData = { ...existingAsset, ...formattedData };
      mergedData = Object.fromEntries(Object.entries(mergedData).filter(([key, value]) => value !== null));

      ParkAssetSchema.parse(mergedData);

      const updateData: Prisma.ParkAssetUpdateInput = Object.entries(formattedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (formattedData.identifierNumber) {
        const checkForExistingAsset = await ParkAssetDao.getParkAssetByIdentifierNumber(formattedData.identifierNumber);
        if (checkForExistingAsset && checkForExistingAsset.id !== id) {
          throw new Error(`Park asset with identifier number ${formattedData.identifierNumber} already exists.`);
        }
      }

      if (formattedData.serialNumber) {
        const checkForExistingAsset = await ParkAssetDao.getParkAssetBySerialNumber(formattedData.serialNumber);
        if (checkForExistingAsset && checkForExistingAsset.id !== id) {
          throw new Error(`Park asset with serial number ${formattedData.serialNumber} already exists.`);
        }
      }

      return ParkAssetDao.updateParkAsset(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`${fromZodError(error).message}`);
      }
      throw error;
    }
  }

  public async deleteParkAsset(id: string): Promise<void> {
    await ParkAssetDao.deleteParkAsset(id);
  }

  public async getParkAssetsNeedingMaintenance(): Promise<ParkAsset[]> {
    return ParkAssetDao.getParkAssetsNeedingMaintenance();
  }

  public async updateParkAssetStatus(assetId: string, newStatus: ParkAssetStatusEnum): Promise<ParkAsset> {
    try {
      const updateData: Prisma.ParkAssetUpdateInput = {
        parkAssetStatus: newStatus,
      };

      return ParkAssetDao.updateParkAsset(assetId, updateData);
    } catch (error) {
      throw new Error(`Unable to update park asset status: ${error.message}`);
    }
  }

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
    const params = {
      Bucket: 'lepark',
      Key: `parkasset/${fileName}`,
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

  public async getParkAssetBySerialNumber(serialNumber: string): Promise<ParkAsset | null> {
    return ParkAssetDao.getParkAssetBySerialNumber(serialNumber);
  }

  private generateIdentifierNumber(assetType: ParkAssetTypeEnum): string {
    const prefix = this.getAssetTypePrefix(assetType);
    return `${prefix}-${uuidv4().substr(0, 8).toUpperCase()}`;
  }

  private getAssetTypePrefix(assetType: ParkAssetTypeEnum): string {
    switch (assetType) {
      case ParkAssetTypeEnum.PLANT_TOOL_AND_EQUIPMENT:
        return 'PT';
      case ParkAssetTypeEnum.HOSES_AND_PIPES:
        return 'HP';
      case ParkAssetTypeEnum.INFRASTRUCTURE:
        return 'IN';
      case ParkAssetTypeEnum.LANDSCAPING:
        return 'LS';
      case ParkAssetTypeEnum.GENERAL_TOOLS:
        return 'GT';
      case ParkAssetTypeEnum.SAFETY:
        return 'SF';
      case ParkAssetTypeEnum.DIGITAL:
        return 'DG';
      case ParkAssetTypeEnum.EVENT:
        return 'EV';
      default:
        return 'PA'; // Default prefix for unknown types
    }
  }
}

// Utility function to ensure all required fields are present
function ensureAllFieldsPresent(data: ParkAssetSchemaType): Prisma.ParkAssetCreateInput {
  if (
    !data.name ||
    !data.parkAssetType ||
    !data.parkAssetStatus ||
    !data.acquisitionDate ||
    !data.supplier ||
    !data.supplierContactNumber ||
    !data.parkAssetCondition ||
    !data.facilityId
  ) {
    throw new Error('Missing required fields for park asset creation');
  }
  return data as Prisma.ParkAssetCreateInput;
}

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

export default new ParkAssetService();
