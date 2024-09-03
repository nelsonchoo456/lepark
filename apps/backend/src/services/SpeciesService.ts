import { Prisma, Species } from '@prisma/client';
import SpeciesDao from '../dao/SpeciesDao';
import StaffDao from '../dao/StaffDao';

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

  public async updateSpeciesDetails(
    id: string,
    data: Prisma.SpeciesUpdateInput,
  ): Promise<Species> {
    // Create an updateData object and only include fields that are provided
    const updateData: Prisma.SpeciesUpdateInput = {};
    if (data.speciesName) updateData.speciesName = data.speciesName;
    if (data.commonName) updateData.commonName = data.commonName;
    if (data.speciesDescription)
      updateData.speciesDescription = data.speciesDescription;
    if (data.conservationStatus)
      updateData.conservationStatus = data.conservationStatus;
    if (data.originCountry) updateData.originCountry = data.originCountry;
    if (data.lightType) updateData.lightType = data.lightType;
    if (data.soilType) updateData.soilType = data.soilType;
    if (data.fertiliserType) updateData.fertiliserType = data.fertiliserType;
    if (data.waterRequirement !== undefined)
      updateData.waterRequirement = data.waterRequirement;
    if (data.fertiliserRequirement !== undefined)
      updateData.fertiliserRequirement = data.fertiliserRequirement;
    if (data.idealHumidity !== undefined)
      updateData.idealHumidity = data.idealHumidity;
    if (data.minTemp !== undefined) updateData.minTemp = data.minTemp;
    if (data.maxTemp !== undefined) updateData.maxTemp = data.maxTemp;
    if (data.idealTemp !== undefined) updateData.idealTemp = data.idealTemp;
    if (data.isDroughtTolerant !== undefined)
      updateData.isDroughtTolerant = data.isDroughtTolerant;
    if (data.isFastGrowing !== undefined)
      updateData.isFastGrowing = data.isFastGrowing;
    if (data.isSlowGrowing !== undefined)
      updateData.isSlowGrowing = data.isSlowGrowing;
    if (data.isEdible !== undefined) updateData.isEdible = data.isEdible;
    if (data.isDeciduous !== undefined)
      updateData.isDeciduous = data.isDeciduous;
    if (data.isEvergreen !== undefined)
      updateData.isEvergreen = data.isEvergreen;
    if (data.isToxic !== undefined) updateData.isToxic = data.isToxic;
    if (data.isFragrant !== undefined) updateData.isFragrant = data.isFragrant;

    return SpeciesDao.updateSpeciesDetails(id, updateData);
  }

  public async deleteSpecies(
    speciesId: string,
    requesterId: string,
  ): Promise<void> {
    const isManager = await StaffDao.isManager(requesterId);
    if (!isManager) {
      throw new Error('Only managers can delete species.');
    }
    await SpeciesDao.deleteSpecies(speciesId);
  }
}

export default new SpeciesService();
