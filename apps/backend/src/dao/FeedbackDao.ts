import { PrismaClient, Prisma, Feedback } from '@prisma/client';

const prisma = new PrismaClient();

class FeedbackDao {
  public async createFeedback(
    data: Prisma.FeedbackCreateInput
  ): Promise<Feedback> {
    return prisma.feedback.create({ data });
  }

  public async getAllFeedbackByVisitorId(
    visitorId: string
  ): Promise<Feedback[]> {
    return prisma.feedback.findMany({ where: { visitorId } });
  }

  public async getAllFeedback(): Promise<Feedback[]> {
    return prisma.feedback.findMany();
  }

  public async getFeedbackById(
    id: string
  ): Promise<Feedback | null> {
    return prisma.feedback.findUnique({ where: { id } });
  }

  public async updateFeedback(
    id: string, 
    data: Prisma.FeedbackUpdateInput
  ): Promise<Feedback> {
    console.log('data', data);
    return prisma.feedback.update({ where: { id }, data });
  }

  public async deleteFeedback(
    id: string
  ): Promise<Feedback> {
    return prisma.feedback.delete({ where: { id } });
  }

  public async getFeedbackByParkId(
    parkId: number
  ): Promise<Feedback[]> {
    return prisma.feedback.findMany({ where: { parkId } });
  }
}

export default new FeedbackDao();
