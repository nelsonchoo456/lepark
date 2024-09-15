import { Prisma, Occurrence } from '@prisma/client';
import { z } from 'zod';
import { OccurrenceSchema, OccurrenceSchemaType } from '../schemas/occurrenceSchema';
import OccurrenceDao from '../dao/OccurrenceDao';
import StaffDao from '../dao/StaffDao';
import SpeciesDao from '../dao/SpeciesDao';
import { fromZodError } from 'zod-validation-error';
import ZoneDao from '../dao/ZoneDao';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class OccurrenceService {
  public async createOccurrence(data: OccurrenceSchemaType): Promise<Occurrence> {
    try {
      if (data.speciesId) {
        const species = await SpeciesDao.getSpeciesById(data.speciesId);
        if (!species) {
          throw new Error('Species not found');
        }
      }

      if (data.zoneId) {
        const zone = await ZoneDao.getZoneById(data.zoneId);
        if (!zone) {
          throw new Error('Zone not found');
        }
      }

      const formattedData = dateFormatter(data);

      // Validate input data using Zod
      OccurrenceSchema.parse(formattedData);

      // Convert validated data to Prisma input type
      const occurrenceData = ensureAllFieldsPresent(formattedData);

      // Create the occurrence, remember to pass in Prisma.occurrenceCreateInput type
      return OccurrenceDao.createOccurrence(occurrenceData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllOccurrence(): Promise<Occurrence[]> {
    return OccurrenceDao.getAllOccurrences();
  }

  public async getAllOccurrenceByParkId(parkId: number): Promise<Occurrence[]> {
    return OccurrenceDao.getAllOccurrencesByParkId(parkId);
  }

  public async getOccurrenceById(id: string): Promise<Occurrence> {
    try {
      const occurrence = await OccurrenceDao.getOccurrenceById(id);
      if (!occurrence) {
        throw new Error('Occurrence not found');
      }
      return occurrence;
    } catch (error) {
      throw new Error(`Unable to fetch occurrence details: ${error.message}`);
    }
  }

  public async updateOccurrenceDetails(
    id: string,
    // Use Partial<OccurrenceSchemaType> to allow partial updates and ensure input validation
    data: Partial<OccurrenceSchemaType>,
  ): Promise<Occurrence> {
    try {
      console.log('data', data);
      const existingOccurrence = await OccurrenceDao.getOccurrenceById(id);
      const formattedData = dateFormatter(data);

      // Merge existing data with update data
      let mergedData = { ...existingOccurrence, ...formattedData };
      mergedData = Object.fromEntries(Object.entries(mergedData).filter(([key, value]) => value !== null));

      // Validate merged data using Zod
      OccurrenceSchema.parse(mergedData);

      // Convert validated OccurrenceSchemaType data to Prisma-compatible update input
      // This ensures only defined fields are included in the update operation
      const updateData: Prisma.OccurrenceUpdateInput = Object.entries(formattedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('updateData', updateData);

      return OccurrenceDao.updateOccurrenceDetails(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteOccurrence(occurrenceId: string, requesterId: string): Promise<void> {
    const isManager = await StaffDao.isManagerOrSuperadmin(requesterId);
    if (!isManager) {
      throw new Error('Only managers can delete occurrence.');
    }
    await OccurrenceDao.deleteOccurrence(occurrenceId);
  }

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
    const params = {
      Bucket: 'lepark',
      Key: `occurrence/${fileName}`,
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

// Utility function to ensure all required fields are present
function ensureAllFieldsPresent(data: OccurrenceSchemaType): Prisma.OccurrenceCreateInput {
  // Add checks for all required fields
  if (!data.dateObserved || !data.numberOfPlants || !data.biomass || !data.speciesId) {
    throw new Error('Missing required fields for occurrence creation');
  }
  return data as Prisma.OccurrenceCreateInput;
}

const dateFormatter = (data: any) => {
  const { dateObserved, dateOfBirth, ...rest } = data;
  const formattedData = { ...rest };

  // Format dateObserved and dateOfBirth into JavaScript Date objects
  const dateObservedFormat = dateObserved ? new Date(dateObserved) : undefined;
  const dateOfBirthFormat = dateOfBirth ? new Date(dateOfBirth) : undefined;
  if (dateObserved) {
    formattedData.dateObserved = dateObservedFormat;
  }
  if (dateOfBirth) {
    formattedData.dateOfBirth = dateOfBirthFormat;
  }
  return formattedData;
};

export default new OccurrenceService();
