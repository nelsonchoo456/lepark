import { Prisma, PrismaClient, SequestrationHistory } from '@prisma/client';

const prisma = new PrismaClient();

class SequestrationHistoryDao {
  async createSequestrationHistory(data: Prisma.SequestrationHistoryCreateInput): Promise<SequestrationHistory> {
    return prisma.sequestrationHistory.create({
      data,
    });
  }

  async updateSequestrationHistory(id: string, data: Prisma.SequestrationHistoryUpdateInput): Promise<SequestrationHistory> {
    return prisma.sequestrationHistory.update({
      where: { id },
      data,
    });
  }

  async deleteSequestrationHistory(id: string): Promise<void> {
    await prisma.sequestrationHistory.delete({
      where: { id },
    });
  }

  async getSequestrationHistoryByAreaId(areaId: string): Promise<SequestrationHistory[]> {
    return prisma.sequestrationHistory.findMany({
      where: { decarbonizationAreaId: areaId },
    });
  }

  async getSequestrationHistoryByAreaIdAndTimeFrame(areaId: string, startDate: Date, endDate: Date): Promise<SequestrationHistory[]> {
    return prisma.sequestrationHistory.findMany({
      where: {
        decarbonizationAreaId: areaId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }
}

export default new SequestrationHistoryDao();
