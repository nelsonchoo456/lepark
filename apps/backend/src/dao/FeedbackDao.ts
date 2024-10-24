import { PrismaClient, Prisma, Feedback } from '@prisma/client';

const prisma = new PrismaClient();

class FeedbackDao {
  async createFeedback(data: Prisma.FeedbackCreateInput): Promise<Feedback> {
    return prisma.feedback.create({ data });
  }

  async getAllFeedbackByVisitorId(visitorId: string): Promise<Feedback[]> {
    return prisma.feedback.findMany({ where: { visitorId } });
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return prisma.feedback.findMany();
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    return prisma.feedback.findUnique({ where: { id } });
  }

  async updateFeedback(id: string, data: Prisma.FeedbackUpdateInput): Promise<Feedback> {
    return prisma.feedback.update({ where: { id }, data });
  }

  async deleteFeedback(id: string): Promise<Feedback> {
    return prisma.feedback.delete({ where: { id } });
  }

  async getFeedbackByParkId(parkId: number): Promise<Feedback[]> {
    return prisma.feedback.findMany({ where: { parkId } });
  }
}

export default new FeedbackDao();