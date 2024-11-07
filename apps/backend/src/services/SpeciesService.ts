import { LightTypeEnum, Occurrence, Prisma, Species } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { SpeciesSchema, SpeciesSchemaType } from '../schemas/speciesSchema';
import SpeciesDao from '../dao/SpeciesDao';
import StaffDao from '../dao/StaffDao';
import aws from 'aws-sdk';
import ZoneDao from '../dao/ZoneDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class SpeciesService {
  public async createSpecies(data: SpeciesSchemaType): Promise<Species> {
    try {
      // Trim speciesName before validation
      data.speciesName = data.speciesName.trim();

      // Validate input data using Zod
      SpeciesSchema.parse(data);

      const checkForExistingSpecies = await SpeciesDao.getSpeciesByName(data.speciesName);

      if (checkForExistingSpecies) {
        throw new Error('Identical species name already exists.');
      }

      // Additional temperature checks
      if (data.minTemp >= data.maxTemp) {
        throw new Error('Minimum temperature must be less than maximum temperature');
      }
      if (data.idealTemp < data.minTemp || data.idealTemp > data.maxTemp) {
        throw new Error('Ideal temperature must be between minimum and maximum temperature');
      }

      // Convert validated data to Prisma input type
      const speciesData = ensureAllFieldsPresent(data);

      // Create the species, remember to pass in Prisma.SpeciesCreateInput type
      return SpeciesDao.createSpecies(speciesData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllSpecies(): Promise<Species[]> {
    return SpeciesDao.getAllSpecies();
  }

  public async getSpeciesById(id: string): Promise<Species> {
    try {
      const species = await SpeciesDao.getSpeciesById(id);
      if (!species) {
        throw new Error('Species not found');
      }
      return species;
    } catch (error) {
      throw new Error(`Unable to fetch species details: ${error.message}`);
    }
  }

  public async getSpeciesNameById(id: string): Promise<string> {
    try {
      const species = await SpeciesDao.getSpeciesById(id);
      if (!species) {
        throw new Error('Species not found');
      }
      return species.speciesName;
    } catch (error) {
      throw new Error(`Unable to fetch species name: ${error.message}`);
    }
  }

  public async updateSpeciesDetails(
    id: string,
    data: Partial<SpeciesSchemaType>,
  ): Promise<Species> {
    try {
      // Get existing species first
      const existingSpecies = await SpeciesDao.getSpeciesById(id);
      if (!existingSpecies) {
        throw new Error('Species not found');
      }

      if (data.speciesName) {
        data.speciesName = data.speciesName.trim();
        // Check for duplicate name only if name is being updated
        const checkForExistingSpecies = await SpeciesDao.getSpeciesByName(data.speciesName);
        if (checkForExistingSpecies && existingSpecies.id !== checkForExistingSpecies.id) {
          throw new Error('Identical species name already exists.');
        }
      }

      // Merge existing data with update data
      const mergedData = { ...existingSpecies, ...data };

      // Temperature validations only if relevant fields are being updated
      if (data.minTemp !== undefined || data.maxTemp !== undefined || data.idealTemp !== undefined) {
        const minTemp = data.minTemp ?? existingSpecies.minTemp;
        const maxTemp = data.maxTemp ?? existingSpecies.maxTemp;
        const idealTemp = data.idealTemp ?? existingSpecies.idealTemp;

        if (minTemp >= maxTemp) {
          throw new Error('Minimum temperature must be less than maximum temperature');
        }
        if (idealTemp < minTemp || idealTemp > maxTemp) {
          throw new Error('Ideal temperature must be between minimum and maximum temperature');
        }
      }

      // For partial updates, we only need to validate the fields being updated
      const partialSchema = SpeciesSchema.partial();
      partialSchema.parse(data);

      return SpeciesDao.updateSpeciesDetails(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteSpecies(speciesId: string): Promise<void> {
    await SpeciesDao.deleteSpecies(speciesId);
  }

  public async getOccurrencesBySpeciesId(speciesId: string): Promise<Occurrence[]> {
    try {
      return await SpeciesDao.findOccurrencesBySpeciesId(speciesId);
    } catch (error) {
      throw new Error(`Error fetching occurrences for species ID ${speciesId}: ${error.message}`);
    }
  }

  public async getOccurrencesBySpeciesIdByParkId(speciesId: string, parkId: string): Promise<Occurrence[]> {
    try {
      const occurrences = await this.getOccurrencesBySpeciesId(speciesId);
      const filteredOccurrences = [];

      for (const occurrence of occurrences) {
        const zone = await ZoneDao.getZoneById(occurrence.zoneId);
        if (String(zone.parkId) === String(parkId)) {
          filteredOccurrences.push(occurrence);
        }
      }
      return filteredOccurrences;
    } catch (error) {
      throw new Error(`Error fetching occurrences for species ID ${speciesId}: ${error.message}`);
    }
  }

  public async uploadImageToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `species/${fileName}`,
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

  public async getSpeciesIdealConditions(speciesId: string): Promise<{
    lightType: LightTypeEnum;
    soilMoisture: number;
    idealHumidity: number;
    minTemp: number;
    maxTemp: number;
  }> {
    const species = await SpeciesDao.getSpeciesById(speciesId);
    if (!species) {
      throw new Error('Species not found');
    }
    return {
      lightType: species.lightType,
      soilMoisture: species.soilMoisture,
      idealHumidity: species.idealHumidity,
      minTemp: species.minTemp,
      maxTemp: species.maxTemp,
    };
  }
}

// Utility function to ensure all required fields are present
function ensureAllFieldsPresent(data: SpeciesSchemaType): Prisma.SpeciesCreateInput {
  // Add checks for all required fields
  if (
    !data.phylum ||
    !data.class ||
    !data.order ||
    !data.family ||
    !data.genus ||
    !data.speciesName ||
    !data.commonName ||
    !data.speciesDescription ||
    !data.conservationStatus ||
    !data.originCountry ||
    !data.lightType ||
    !data.soilType ||
    !data.fertiliserType ||
    !data.soilMoisture ||
    !data.fertiliserRequirement ||
    !data.idealHumidity ||
    !data.minTemp ||
    !data.maxTemp ||
    !data.idealTemp ||
    data.isDroughtTolerant === undefined ||
    data.isFastGrowing === undefined ||
    data.isSlowGrowing === undefined ||
    data.isEdible === undefined ||
    data.isDeciduous === undefined ||
    data.isEvergreen === undefined ||
    data.isToxic === undefined ||
    data.isFragrant === undefined
  ) {
    throw new Error('Missing required fields for species creation');
  }
  return data as Prisma.SpeciesCreateInput;
}

export default new SpeciesService();
