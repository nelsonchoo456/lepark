import { PrismaClient, Prisma, Visitor, Species } from '@prisma/client';

const prisma = new PrismaClient();

class VisitorDao {
  public async createVisitor(
    data: Prisma.VisitorCreateInput
  ): Promise<Visitor> {
    return prisma.visitor.create({ data });
  }

  public async getVisitorByEmail(
    email: string
  ): Promise<Visitor | null> {
    return prisma.visitor.findUnique({ where: { email } });
  }

  public async getAllVisitors(): Promise<Visitor[]> {
    return prisma.visitor.findMany();
  }

  public async getVisitorById(
    id: string
  ): Promise<Visitor | null> {
    return prisma.visitor.findUnique({ where: { id } });
  }

  public async updateVisitorDetails(
    id: string, 
    data: Prisma.VisitorUpdateInput
  ): Promise<Visitor> {
    return prisma.visitor.update({ where: { id }, data });
  }

  public async addFavoriteSpecies(
    visitorId: string, 
    speciesId: string
  ): Promise<Visitor> {
    return prisma.visitor.update({
      where: { id: visitorId },
      data: {
        favoriteSpecies: {
          connect: { id: speciesId },
        },
      },
      include: {
        favoriteSpecies: true,
      },
    });
  }

  public async getFavoriteSpecies(
    visitorId: string
  ): Promise<{ favoriteSpecies: Species[] } | null> {
    return prisma.visitor.findUnique({
      where: { id: visitorId },
      select: {
        favoriteSpecies: true,
      },
    });
  }

  public async deleteSpeciesFromFavorites(
    visitorId: string, 
    speciesId: string
  ): Promise<Visitor> {
    return prisma.visitor.update({
      where: { id: visitorId },
      data: {
        favoriteSpecies: {
          disconnect: { id: speciesId },
        },
      },
      include: {
        favoriteSpecies: true,
      },
    });
  }

  public async deleteVisitor(
    id: string
  ): Promise<Visitor> {
    return prisma.visitor.delete({ where: { id } });
  }
}

export default new VisitorDao();
