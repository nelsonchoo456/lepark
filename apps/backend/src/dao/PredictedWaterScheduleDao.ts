import { PrismaClient, Prisma, PredictedWaterSchedule } from '@prisma/client';

const prisma = new PrismaClient();

class PredictedWaterScheduleDao {
  async createPredictedWaterSchedule(data: Prisma.PredictedWaterScheduleCreateInput): Promise<PredictedWaterSchedule> {
    return prisma.predictedWaterSchedule.create({ data: { ...data } });
  }

  async getPredictedWaterSchedulesByHubId(hubId: string): Promise<PredictedWaterSchedule[]> {
    return prisma.predictedWaterSchedule.findMany({
      where: { hubId },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async getPredictedWaterSchedulesByDateRange(startDate: Date, endDate: Date): Promise<PredictedWaterSchedule[]> {
    return prisma.predictedWaterSchedule.findMany({
      where: {
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async updatePredictedWaterSchedule(id: string, data: Prisma.PredictedWaterScheduleUpdateInput): Promise<PredictedWaterSchedule> {
    return prisma.predictedWaterSchedule.update({
      where: { id },
      data,
    });
  }

  async deletePredictedWaterSchedule(id: string): Promise<void> {
    await prisma.predictedWaterSchedule.delete({ where: { id } });
  }
}

export default new PredictedWaterScheduleDao();