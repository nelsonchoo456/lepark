import FeedbackDao from './FeedbackDao';
import VisitorDao from './VisitorDao';
import StaffDao from './StaffDao';
import { FeedbackSchemaType } from './FeedbackSchema';
import { Feedback } from '@prisma/client';

class FeedbackService {
  public async createFeedback(data: FeedbackSchemaType): Promise<Feedback> {
    const validatedData = FeedbackSchema.parse(data);
    return FeedbackDao.createFeedback(validatedData);
  }

  public async getAllFeedbacks(visitorId: string): Promise<any[]> {
    const feedbacks = await FeedbackDao.getAllFeedbacks(visitorId);
    const feedbacksWithDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        const visitor = await VisitorDao.getVisitorById(feedback.visitorId);
        const staff = feedback.staffId ? await StaffDao.getStaffById(feedback.staffId) : null;
        return { ...feedback, visitor, staff };
      }),
    );
    return feedbacksWithDetails;
  }

  public async getFeedbackById(id: string): Promise<any> {
    const feedback = await FeedbackDao.getFeedbackById(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }
    const visitor = await VisitorDao.getVisitorById(feedback.visitorId);
    const staff = feedback.staffId ? await StaffDao.getStaffById(feedback.staffId) : null;
    return { ...feedback, visitor, staff };
  }

  public async updateFeedback(id: string, data: Partial<FeedbackSchemaType>): Promise<any> {
    const validatedData = FeedbackSchema.partial().parse(data);
    const updatedFeedback = await FeedbackDao.updateFeedback(id, validatedData);
    const visitor = await VisitorDao.getVisitorById(updatedFeedback.visitorId);
    const staff = updatedFeedback.staffId ? await StaffDao.getStaffById(updatedFeedback.staffId) : null;
    return { ...updatedFeedback, visitor, staff };
  }

  public async deleteFeedback(id: string): Promise<void> {
    await FeedbackDao.deleteFeedback(id);
  }
}

export default new FeedbackService();
