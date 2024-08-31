import { PrismaClient, Prisma, Species } from '@prisma/client';

const prisma = new PrismaClient();

class SpeciesDao {
  async createSpecies(data: Prisma.SpeciesUncheckedCreateInput): Promise<Species> {
    return prisma.species.create({ data });
  }

  async getAllSpecies(): Promise<Species[]> {
    return prisma.species.findMany();
  }

  async getSpeciesById(id: string): Promise<Species> {
    return prisma.species.findUnique({ where: { id } });
  }

  async updateSpeciesDetails(
    id: string,
    data: Prisma.SpeciesUpdateInput,
  ): Promise<Species> {
    return prisma.species.update({ where: { id }, data });
  }
}

export default new SpeciesDao();
