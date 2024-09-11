import { PrismaClient, Prisma, StatusLog } from '@prisma/client';

const prisma = new PrismaClient();

class StatusLogDao {
  async createStatusLog(data: Prisma.StatusLogCreateInput): Promise<StatusLog> {
    return prisma.statusLog.create({ data });
  }

  async getStatusLogsByOccurrenceId(occurrenceId: string): Promise<StatusLog[]> {
    return prisma.statusLog.findMany({ where: { occurrenceId } });
  }

  async getStatusLogById(id: string): Promise<StatusLog | null> {
    return prisma.statusLog.findUnique({ where: { id } });
  }

  async updateStatusLog(id: string, data: Prisma.StatusLogUpdateInput): Promise<StatusLog> {
    return prisma.statusLog.update({ where: { id }, data });
  }

  async deleteStatusLog(id: string): Promise<void> {
    await prisma.statusLog.delete({ where: { id } });
  }
}

export default new StatusLogDao();
