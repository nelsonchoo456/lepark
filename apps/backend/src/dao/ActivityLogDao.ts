import { PrismaClient, Prisma, ActivityLog } from '@prisma/client';

const prisma = new PrismaClient();

class ActivityLogDao {
  public async createActivityLog(
    data: Prisma.ActivityLogCreateInput
  ): Promise<ActivityLog> {
    return prisma.activityLog.create({ data });
  }

  public async getActivityLogsByOccurrenceId(
    occurrenceId: string
  ): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({ where: { occurrenceId } });
  }

  public async getActivityLogById(
    id: string
  ): Promise<ActivityLog | null> {
    return prisma.activityLog.findUnique({ where: { id } });
  }

  public async updateActivityLog(
    id: string, 
    data: Prisma.ActivityLogUpdateInput
  ): Promise<ActivityLog> {
    return prisma.activityLog.update({ where: { id }, data });
  }

  public async deleteActivityLog(
    id: string
  ): Promise<void> {
    await prisma.activityLog.delete({ where: { id } });
  }
}

export default new ActivityLogDao();
