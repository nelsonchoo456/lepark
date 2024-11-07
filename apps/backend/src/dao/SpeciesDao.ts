import { PrismaClient, Prisma, Species, Occurrence } from '@prisma/client';

const prisma = new PrismaClient();

class SpeciesDao {
  public async createSpecies(
    data: Prisma.SpeciesCreateInput
  ): Promise<Species> {
    return prisma.species.create({ data });
  }

  public async getAllSpecies(): Promise<Species[]> {
    return prisma.species.findMany();
  }

  public async getSpeciesByName(
    speciesName: string
  ): Promise<Species> {
    return prisma.species.findUnique({ where: { speciesName } });
  }

  public async getSpeciesById(
    id: string
  ): Promise<Species | null> {
    return prisma.species.findUnique({ where: { id } });
  }

  public async updateSpeciesDetails(
    id: string,
    data: Prisma.SpeciesUpdateInput
  ): Promise<Species> {
    return prisma.species.update({ where: { id }, data });
  }

  public async deleteSpecies(
    id: string
  ): Promise<void> {
    await prisma.species.delete({ where: { id } });
  }

  public async getSpeciesByIds(
    ids: string[]
  ): Promise<Species[]> {
    return prisma.species.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  public async findOccurrencesBySpeciesId(
    speciesId: string
  ): Promise<Occurrence[]> {
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
