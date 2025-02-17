import FeedbackDao from '../dao/FeedbackDao';
import VisitorDao from '../dao/VisitorDao';
import StaffDao from '../dao/StaffDao';
import { Feedback, Prisma, Staff, Visitor } from '@prisma/client';
import { FeedbackSchema, FeedbackSchemaType } from '../schemas/feedbackSchema';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class FeedbackService {
  public async createFeedback(data: FeedbackSchemaType): Promise<Feedback> {
    const formattedData = dateFormatter(data);
    const validatedData = FeedbackSchema.parse(formattedData) as Prisma.FeedbackCreateInput;
    return FeedbackDao.createFeedback(validatedData);
  }

  public async getAllFeedback(visitorId?: string): Promise<(Feedback & { visitor: Visitor; resolvedStaff: Staff | null })[]> {
    let feedback: Feedback[];
    if (visitorId) {
      feedback = await FeedbackDao.getAllFeedbackByVisitorId(visitorId);
    } else {
      feedback = await FeedbackDao.getAllFeedback();
    }
    const feedbacksWithDetails = await Promise.all(
      feedback.map(async (feedback) => {
        const visitor = await VisitorDao.getVisitorById(feedback.visitorId);
        const resolvedStaff = feedback.resolvedStaffId ? await StaffDao.getStaffById(feedback.resolvedStaffId) : null;
        return { ...feedback, visitor, resolvedStaff };
      }),
    );
    return feedbacksWithDetails;
  }

  public async getFeedbackById(id: string): Promise<Feedback & { visitor: Visitor; resolvedStaff: Staff | null }> {
    const feedback = await FeedbackDao.getFeedbackById(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }
    const visitor = await VisitorDao.getVisitorById(feedback.visitorId);
    const resolvedStaff = feedback.resolvedStaffId ? await StaffDao.getStaffById(feedback.resolvedStaffId) : null;
    return { ...feedback, visitor, resolvedStaff };
  }

  public async updateFeedback(
    id: string,
    data: Partial<FeedbackSchemaType>,
  ): Promise<Feedback & { visitor: Visitor; resolvedStaff: Staff | null }> {
    const formattedData = dateFormatter(data) as Prisma.FeedbackUpdateInput;
    const validatedData = FeedbackSchema.partial().parse(formattedData);
    const updatedFeedback = await FeedbackDao.updateFeedback(id, validatedData);
    const visitor = await VisitorDao.getVisitorById(updatedFeedback.visitorId);
    const resolvedStaff = updatedFeedback.resolvedStaffId ? await StaffDao.getStaffById(updatedFeedback.resolvedStaffId) : null;
    return { ...updatedFeedback, visitor, resolvedStaff };
  }

  public async deleteFeedback(id: string): Promise<void> {
    await FeedbackDao.deleteFeedback(id);
  }

  public async uploadImageToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `feedback/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Error uploading image to S3');
    }
  }

  public async getFeedbackByParkId(parkId: number): Promise<(Feedback & { visitor: Visitor; resolvedStaff: Staff | null })[]> {
    const feedbacks = await FeedbackDao.getFeedbackByParkId(parkId);
    const feedbacksWithDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        const visitor = await VisitorDao.getVisitorById(feedback.visitorId);
        const resolvedStaff = feedback.resolvedStaffId ? await StaffDao.getStaffById(feedback.resolvedStaffId) : null;
        return { ...feedback, visitor, resolvedStaff };
      }),
    );
    return feedbacksWithDetails;
  }
}

// Utility function to format date fields
const dateFormatter = (data: any) => {
  const { dateCreated, dateResolved, ...rest } = data;
  const formattedData = { ...rest };

  // Format dateCreated and dateResolved into JavaScript Date objects
  const dateCreatedFormat = dateCreated ? new Date(dateCreated) : undefined;
  const dateResolvedFormat = dateResolved ? new Date(dateResolved) : undefined;
  if (dateCreated) {
    formattedData.dateCreated = dateCreatedFormat;
  }
  if (dateResolved) {
    formattedData.dateResolved = dateResolvedFormat;
  }
  return formattedData;
};

export default new FeedbackService();
