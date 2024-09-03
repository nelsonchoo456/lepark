import { PrismaClient, Prisma, Species } from '@prisma/client';

const prisma = new PrismaClient();

class SpeciesDao {
  async createSpecies(
    // Use Prisma.SpeciesCreateInput for direct compatibility with Prisma's create operation
    data: Prisma.SpeciesCreateInput): Promise<Species> {
    return prisma.species.create({ data });
  }

  async getAllSpecies(): Promise<Species[]> {
    return prisma.species.findMany();
  }

  async getSpeciesById(id: string): Promise<Species | null> {
    return prisma.species.findUnique({ where: { id } });
  }

  async updateSpeciesDetails(
    id: string,
    // Use Prisma.SpeciesUpdateInput for direct compatibility with Prisma's update operation
    data: Prisma.SpeciesUpdateInput
  ): Promise<Species | null> {
    return prisma.species.update({ where: { id }, data });
  }

  async deleteSpecies(id: string): Promise<void> {
    await prisma.species.delete({ where: { id } });
  }
}

export default new SpeciesDao();
