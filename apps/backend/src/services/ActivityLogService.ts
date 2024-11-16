import { Prisma, ActivityLog } from '@prisma/client';
import { z } from 'zod';
import { ActivityLogSchema, ActivityLogSchemaType } from '../schemas/activityLogSchema';
import ActivityLogDao from '../dao/ActivityLogDao';
import { fromZodError } from 'zod-validation-error';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class ActivityLogService {
  public async createActivityLog(data: ActivityLogSchemaType): Promise<ActivityLog> {
    try {
      const formattedData = dateFormatter(data);

      ActivityLogSchema.parse(formattedData);

      // Convert validated data to Prisma input type
      const activityLogData = ensureAllFieldsPresent(formattedData);

      // Create the activity log, remember to pass in Prisma.activityLogCreateInput type
      return ActivityLogDao.createActivityLog(activityLogData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getActivityLogsByOccurrenceId(occurrenceId: string): Promise<ActivityLog[]> {
    return ActivityLogDao.getActivityLogsByOccurrenceId(occurrenceId);
  }

  public async getActivityLogById(id: string): Promise<ActivityLog> {
    try {
      const activityLog = await ActivityLogDao.getActivityLogById(id);
      if (!activityLog) {
        throw new Error('Activity log not found');
      }
      return activityLog;
    } catch (error) {
      throw new Error(`Unable to fetch activity log details: ${error.message}`);
    }
  }

  public async updateActivityLog(id: string, data: Partial<ActivityLogSchemaType>): Promise<ActivityLog> {
    try {
      const existingActivityLog = await this.getActivityLogById(id);
      const formattedData = dateFormatter(data);

      const mergedData = { ...existingActivityLog, ...formattedData };
      ActivityLogSchema.parse(mergedData);

      const updateData: Prisma.ActivityLogUpdateInput = Object.entries(mergedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return ActivityLogDao.updateActivityLog(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  // To decide who can delete activity log
  public async deleteActivityLog(id: string): Promise<void> {
    await ActivityLogDao.deleteActivityLog(id);
  }

  public async uploadImageToS3(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `activitylog/${fileName}`,
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
}

// Utility function to ensure all required fields are present
function ensureAllFieldsPresent(data: ActivityLogSchemaType): Prisma.ActivityLogCreateInput {
  // Add checks for all required fields
  if (!data.name || !data.description || !data.dateCreated || !data.activityLogType || !data.occurrenceId) {
    throw new Error('Missing required fields for activity log creation');
  }
  return data as Prisma.ActivityLogCreateInput;
}

const dateFormatter = (data: any) => {
  const { dateCreated, ...rest } = data;
  const formattedData = { ...rest };

  // Format dateCreated into JavaScript Date objects
  const dateCreatedFormat = dateCreated ? new Date(dateCreated) : undefined;
  if (dateCreated) {
    formattedData.dateCreated = dateCreatedFormat;
  }
  return formattedData;
};

export default new ActivityLogService();
