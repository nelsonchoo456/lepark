import { PrismaClient, Prisma, Occurrence } from '@prisma/client';

const prisma = new PrismaClient();

class OccurrenceDao {
  async createOccurrence(data: Prisma.OccurrenceCreateInput): Promise<Occurrence> {
    return prisma.occurrence.create({ data });
  }

  async getAllOccurrences(): Promise<Occurrence[]> {
    return prisma.occurrence.findMany();
  }

  async getOccurrenceById(id: string): Promise<Occurrence> {
    return prisma.occurrence.findUnique({ where: { id } });
  }

  async updateOccurrenceDetails(id: string, data: Prisma.OccurrenceUpdateInput): Promise<Occurrence> {
    return prisma.occurrence.update({ where: { id }, data });
  }

  async deleteOccurrence(id: string): Promise<void> {
    await prisma.occurrence.delete({ where: { id } });
  }
}

export default new OccurrenceDao();
