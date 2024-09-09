import { PrismaClient, Prisma, ActivityLog } from '@prisma/client';

const prisma = new PrismaClient();

class ActivityLogDao {
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

export default new ActivityLogDao();
