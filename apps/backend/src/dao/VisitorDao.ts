import { PrismaClient, Prisma, Visitor } from '@prisma/client';

const prisma = new PrismaClient();

class VisitorDao {
  async createVisitor(data: Prisma.VisitorCreateInput): Promise<Visitor> {
    return prisma.visitor.create({ data });
  }

  async getVisitorByEmail(email: string): Promise<Visitor | null> {
    return prisma.visitor.findUnique({ where: { email } });
  }

  async getAllVisitors(): Promise<Visitor[]> {
    return prisma.visitor.findMany();
  }

  async getVisitorById(id: string): Promise<Visitor | null> {
    return prisma.visitor.findUnique({ where: { id } });
  }

  async updateVisitorDetails(id: string, data: Prisma.VisitorUpdateInput): Promise<Visitor> {
    return prisma.visitor.update({ where: { id }, data });
  }

  // Commented out as duplicate with above method

  // async updateVisitor(id: string, data: Prisma.VisitorUpdateInput): Promise<Visitor | null> {
  //   return prisma.visitor.update({
  //     where: { id },
  //     data,
  //   });
  // }

  async addFavoriteSpecies(visitorId: string, speciesId: string): Promise<Visitor> {
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

  async getFavoriteSpecies(visitorId: string) {
    return prisma.visitor.findUnique({
      where: { id: visitorId },
      select: {
        favoriteSpecies: true,
      },
    });
  }

  async deleteSpeciesFromFavorites(visitorId: string, speciesId: string): Promise<Visitor> {
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

  //   async deleteAdmin(id: string) {
  //     return prisma.admin.delete({ where: { id } });
  //   }
}

export default new VisitorDao();
