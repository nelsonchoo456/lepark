import { Prisma, Species } from '@prisma/client';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { SpeciesSchema, SpeciesSchemaType } from '../schemas/speciesSchema';
import SpeciesDao from '../dao/SpeciesDao';
import StaffDao from '../dao/StaffDao';

class SpeciesService {
  public async createSpecies(data: SpeciesSchemaType): Promise<Species> {
    try {
      // Validate input data using Zod
      SpeciesSchema.parse(data);

      const checkForExistingSpecies = await SpeciesDao.getSpeciesByName(data.speciesName);

      if (checkForExistingSpecies) {
        throw new Error('Species already exists.');
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
