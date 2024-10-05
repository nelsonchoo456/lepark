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

  async deleteSequestrationHistoryForDate(decarbonizationAreaId: string, date: Date): Promise<void> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    await prisma.sequestrationHistory.deleteMany({
      where: {
        decarbonizationAreaId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async getTotalSequestrationForParkAndDate(parkId: number, date: Date): Promise<number> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const result = await prisma.sequestrationHistory.aggregate({
      _sum: {
        seqValue: true
      },
      where: {
        decarbonizationArea: {
          parkId: parkId
        },
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    console.log('Aggregation result:', result);
    return result._sum.seqValue || 0;
  }
}

export default new SequestrationHistoryDao();
