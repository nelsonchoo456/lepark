import { Prisma, Species } from '@prisma/client';
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
    // Use Partial<SpeciesSchemaType> to allow partial updates and ensure input validation
    data: Partial<SpeciesSchemaType>,
  ): Promise<Species> {
    try {
      const existingSpecies = await SpeciesDao.getSpeciesById(id);

      const checkForExistingSpecies = await SpeciesDao.getSpeciesByName(existingSpecies.speciesName);

      if (checkForExistingSpecies) {
        throw new Error('Identical species name already exists.');
      }

      // Merge existing data with update data
      const mergedData = { ...existingSpecies, ...data };

      // Validate merged data using Zod
      SpeciesSchema.parse(mergedData);

      // Convert validated SpeciesSchemaType data to Prisma-compatible update input
      // This ensures only defined fields are included in the update operation
      const updateData: Prisma.SpeciesUpdateInput = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Additional temperature checks
      const minTemp = data.minTemp ?? existingSpecies.minTemp;
      const maxTemp = data.maxTemp ?? existingSpecies.maxTemp;
      const idealTemp = data.idealTemp ?? existingSpecies.idealTemp;

      if (minTemp !== undefined && maxTemp !== undefined && minTemp >= maxTemp) {
        throw new Error('Minimum temperature must be less than maximum temperature');
      }
      if (idealTemp !== undefined) {
        if (minTemp !== undefined && idealTemp < minTemp) {
          throw new Error('Ideal temperature must be greater than or equal to minimum temperature');
        }
        if (maxTemp !== undefined && idealTemp > maxTemp) {
          throw new Error('Ideal temperature must be less than or equal to maximum temperature');
        }
      }

      return SpeciesDao.updateSpeciesDetails(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async deleteSpecies(speciesId: string): Promise<void> {
    await SpeciesDao.deleteSpecies(speciesId);
  }

  public async getOccurrencesBySpeciesId(speciesId: string) {
    try {
      return await SpeciesDao.findOccurrencesBySpeciesId(speciesId);
    } catch (error) {
      throw new Error(`Error fetching occurrences for species ID ${speciesId}: ${error.message}`);
    }
  }

  public async getOccurrencesBySpeciesIdByParkId(speciesId: string, parkId: string) {
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

  public async uploadImageToS3(fileBuffer, fileName, mimeType) {
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
    !data.waterRequirement ||
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
