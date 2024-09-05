import { Prisma, Occurrence } from '@prisma/client';
import OccurenceDao from '../dao/OccurrenceDao';
import StaffDao from '../dao/StaffDao';

class OccurenceService {
  public async createOccurence(
    data: Prisma.OccurrenceUncheckedCreateInput,
  ): Promise<Occurrence> {
    // Validate input data
    if (
      !data.dateObserved ||
      !data.dateOfBirth ||
      !data.numberOfPlants ||
      !data.biomass ||
      !data.description ||
      !data.decarbonizationType
      // || !data.speciesId || // [ DEPENDENCY ] Uncomment when species is made
      // !data.decarbonizationAreaId // [ DEPENDENCY ] Uncomment when decarbonizationAreaId is made
    ) {
      throw new Error('All fields are required.');
    }

    return OccurenceDao.createOccurrence(data);
  }

  public async getAllOccurrence(): Promise<Occurrence[]> {
    return OccurenceDao.getAllOccurrences();
  }

  public async getOccurrenceById(id: string): Promise<Occurrence> {
    return OccurenceDao.getOccurrenceById(id);
  }

  public async updateOccurrenceDetails(
    id: string,
    data: Prisma.OccurrenceUpdateInput,
  ): Promise<Occurrence> {
    // Create an updateData object and only include fields that are provided
    const updateData: Prisma.OccurrenceUpdateInput = {};
    if (data.dateObserved) updateData.dateObserved = data.dateObserved;
    if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
    if (data.numberOfPlants)
      updateData.numberOfPlants = data.numberOfPlants;
    if (data.biomass)
      updateData.biomass = data.biomass;
    if (data.description) updateData.description = data.description;
    if (data.decarbonizationType) updateData.decarbonizationType = data.decarbonizationType;

    return OccurenceDao.updateOccurrenceDetails(id, updateData);
  }

  public async deleteOccurrence(
    occurrenceId: string,
    requesterId: string,
  ): Promise<void> {
    const isManager = await StaffDao.isManager(requesterId); // Change role
    if (!isManager) {
      throw new Error('Only managers can delete species.');
    }
    await OccurenceDao.deleteOccurrence(occurrenceId);
  }
}

export default new OccurenceService();
