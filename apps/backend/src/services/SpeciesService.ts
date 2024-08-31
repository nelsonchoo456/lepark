import { Prisma, Species } from '@prisma/client';
import SpeciesDao from '../dao/SpeciesDao';

class SpeciesService {
  public async createSpecies(
    data: Prisma.SpeciesCreateInput,
  ): Promise<Species> {
    // Validate input data
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
      data.waterRequirement === undefined ||
      data.fertiliserRequirement === undefined ||
      data.idealHumidity === undefined ||
      data.minTemp === undefined ||
      data.maxTemp === undefined ||
      data.idealTemp === undefined ||
      data.isDroughtTolerant === undefined ||
      data.isFastGrowing === undefined ||
      data.isSlowGrowing === undefined ||
      data.isEdible === undefined ||
      data.isDeciduous === undefined ||
      data.isEvergreen === undefined ||
      data.isToxic === undefined ||
      data.isFragrant === undefined
    ) {
      throw new Error('All fields are required.');
    }

    return SpeciesDao.createSpecies(data);
  }

  public async getAllSpecies(): Promise<Species[]> {
    return SpeciesDao.getAllSpecies();
  }

  public async getSpeciesById(id: string): Promise<Species> {
    return SpeciesDao.getSpeciesById(id);
  }
}

export default new SpeciesService();
