import { PrismaClient, Prisma, Species, Occurrence } from '@prisma/client';

const prisma = new PrismaClient();

class SpeciesDao {
  async createSpecies(
    // Use Prisma.SpeciesCreateInput for direct compatibility with Prisma's create operation
    data: Prisma.SpeciesCreateInput,
  ): Promise<Species> {
    return prisma.species.create({ data });
  }

  async getAllSpecies(): Promise<Species[]> {
    return prisma.species.findMany();
  }

  async getSpeciesByName(speciesName: string): Promise<Species> {
    return prisma.species.findUnique({ where: { speciesName } });
  }

  async getSpeciesById(id: string): Promise<Species | null> {
    return prisma.species.findUnique({ where: { id } });
  }

  async updateSpeciesDetails(
    id: string,
    // Use Prisma.SpeciesUpdateInput for direct compatibility with Prisma's update operation
    data: Prisma.SpeciesUpdateInput,
  ): Promise<Species> {
    return prisma.species.update({ where: { id }, data });
  }

  async deleteSpecies(id: string): Promise<void> {
    await prisma.species.delete({ where: { id } });
  }

  async getSpeciesByIds(ids: string[]): Promise<Species[]> {
    return prisma.species.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findOccurrencesBySpeciesId(speciesId: string): Promise<Occurrence[]> {
    try {
      return await prisma.occurrence.findMany({
        where: {
          speciesId: speciesId,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching occurrences for species ID ${speciesId}: ${error.message}`);
    }
  }
}

export default new SpeciesDao();
