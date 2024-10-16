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
    return result._sum.seqValue || 0;
  }

    async getTotalSequestrationForParkAndYear(parkId: number, year: number): Promise<number> {
  const startOfYear = new Date(year, 0, 1); // January 1st of the given year
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the given year

  const whereClause = {
    date: {
      gte: startOfYear,
      lte: endOfYear
    }
  };

  // If parkId is not 0, add it to the where clause
  if (parkId !== 0) {
    whereClause['decarbonizationArea'] = { parkId: parkId };
  }

  const result = await prisma.sequestrationHistory.aggregate({
    _sum: {
      seqValue: true
    },
    where: whereClause
  });

  const totalSequestration = result._sum.seqValue || 0;

  return totalSequestration;
  }
}

export default new SequestrationHistoryDao();
