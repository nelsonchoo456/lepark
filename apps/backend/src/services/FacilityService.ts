import aws from 'aws-sdk';
import { Prisma, Facility } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { FacilitySchema, FacilitySchemaType } from '../schemas/facilitySchema';
import FacilityDao from '../dao/FacilityDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class FacilityService {
  public async createFacility(
    data: FacilitySchemaType
  ): Promise<Facility> {
    try {
      const existingFacility = await FacilityDao.getFacilityByNameAndParkId(data.name, data.parkId);
      if (existingFacility) {
        throw new Error('A facility with this name already exists in the park.');
      }

      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      FacilitySchema.parse(formattedData);

      const facilityData = ensureAllFieldsPresent(formattedData);

      // Create the facility
      return FacilityDao.createFacility(facilityData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllFacilities(): Promise<Facility[]> {
    return FacilityDao.getAllFacilities();
  }

  public async getFacilityById(
    id: string
  ): Promise<Facility> {
    const facility = await FacilityDao.getFacilityById(id);
    if (!facility) {
      throw new Error('Facility not found');
    }
    return facility;
  }

  public async updateFacilityDetails(
    id: string, 
    data: Partial<FacilitySchemaType>
  ): Promise<Facility> {
    try {
      const existingFacility = await FacilityDao.getFacilityById(id);
      if (!existingFacility) {
        throw new Error('Facility not found');
      }

      const formattedData = dateFormatter(data);

      // Merge existing data with update data
      const mergedData = { ...existingFacility, ...formattedData };

      // Validate merged data using Zod
      FacilitySchema.parse(mergedData);

      const existingFacilityInNewPark = await FacilityDao.getFacilityByNameAndParkId(mergedData.name, data.parkId);
      if (existingFacilityInNewPark && existingFacilityInNewPark.id !== id) {
        throw new Error('A facility with this name already exists in the park.');
      }

      // Convert validated FacilitySchemaType data to Prisma-compatible update input
      const updateData: Prisma.FacilityUpdateInput = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return FacilityDao.updateFacility(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteFacility(
    id: string
  ): Promise<void> {
    await FacilityDao.deleteFacility(id);
  }

  public async getFacilitiesByParkId(
    parkId: number
  ): Promise<Facility[]> {
    return FacilityDao.getFacilitiesByParkId(parkId);
  }

  public async uploadImageToS3(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `facility/${fileName}`,
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

  public async checkExistingFacility(
    name: string, 
    parkId: number
  ): Promise<boolean> {
    const existingFacility = await FacilityDao.getFacilityByNameAndParkId(name, parkId);
    return !!existingFacility; // Returns true if exists, false otherwise
  }
}

function ensureAllFieldsPresent(data: FacilitySchemaType): Prisma.FacilityCreateInput {
  // Add checks for all required fields
  if (
    !data.name ||
    !data.description ||
    !data.isBookable === undefined ||
    !data.isPublic === undefined ||
    !data.isSheltered === undefined ||
    !data.facilityType ||
    !data.reservationPolicy ||
    !data.rulesAndRegulations ||
    !data.images ||
    !data.openingHours ||
    !data.closingHours ||
    !data.facilityStatus ||
    !data.lat ||
    !data.long ||
    !data.size ||
    !data.capacity === undefined ||
    !data.fee === undefined ||
    !data.parkId
  ) {
    throw new Error('Missing required fields for facility creation');
  }
  return data as Prisma.FacilityCreateInput;
}

const dateFormatter = (data: any) => {
  const { openingHours, closingHours, ...rest } = data;
  const formattedData = { ...rest };

  if (openingHours) {
    formattedData.openingHours = openingHours.map((time: string) => new Date(time));
  }
  if (closingHours) {
    formattedData.closingHours = closingHours.map((time: string) => new Date(time));
  }

  return formattedData;
};

export default new FacilityService();
