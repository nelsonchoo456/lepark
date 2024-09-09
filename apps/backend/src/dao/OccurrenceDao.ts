import { PrismaClient, Prisma, Occurrence, ActivityLog } from '@prisma/client';

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

  /* ACTIVITY LOG DAO */

  async createActivityLog(data: Prisma.ActivityLogCreateInput): Promise<ActivityLog> {
    return prisma.activityLog.create({ data });
  }

  async getActivityLogsByOccurrenceId(occurrenceId: string): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({ where: { occurrenceId } });
  }

  async getActivityLogById(id: string): Promise<ActivityLog> {
    return prisma.activityLog.findUnique({ where: { id } });
  }

  async updateActivityLog(id: string, data: Prisma.ActivityLogUpdateInput): Promise<ActivityLog> {
    return prisma.activityLog.update({ where: { id }, data });
  }

  async deleteActivityLog(id: string): Promise<void> {
    await prisma.activityLog.delete({ where: { id } });
  }
}

export default new OccurrenceDao();
