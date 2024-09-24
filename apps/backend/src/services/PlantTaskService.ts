import { Prisma, PlantTask, PlantTaskUrgencyEnum, PlantTaskStatusEnum } from '@prisma/client';
import { z } from 'zod';
import { PlantTaskSchema, PlantTaskSchemaType } from '../schemas/plantTaskSchema';
import PlantTaskDao from '../dao/PlantTaskDao';
import OccurrenceDao from '../dao/OccurrenceDao';
import ZoneDao from '../dao/ZoneDao';
import StaffDao from '../dao/StaffDao';
import { fromZodError } from 'zod-validation-error';
import { StaffRoleEnum } from '@prisma/client';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class PlantTaskService {
  public async createPlantTask(data: PlantTaskSchemaType, submittingStaffId: string): Promise<PlantTask> {
    try {
      const staff = await StaffDao.getStaffById(submittingStaffId);
      if (!staff) {
        throw new Error('Staff not found');
      }

      if (staff.role !== StaffRoleEnum.SUPERADMIN && staff.role !== StaffRoleEnum.BOTANIST && staff.role !== StaffRoleEnum.ARBORIST) {
        throw new Error('Only Superadmins, Botanists and Arborists can create plant tasks');
      }

      const occurrence = await OccurrenceDao.getOccurrenceById(data.occurrenceId);
      if (!occurrence) {
        throw new Error('Occurrence not found');
      }

      const zone = await ZoneDao.getZoneById(occurrence.zoneId);
      if (!zone) {
        throw new Error('Zone not found');
      }

      if (staff.role !== StaffRoleEnum.SUPERADMIN) {
        if (zone.parkId !== staff.parkId) {
          throw new Error('Staff can only create tasks for their assigned park');
        }
      }

      const formattedData = dateFormatter(data);

      // Calculate due date based on urgency
      const createdAt = new Date();
      const dueDate = this.calculateDueDate(createdAt, formattedData.taskUrgency);
      const taskStatus = PlantTaskStatusEnum.OPEN;

      formattedData.createdAt = createdAt;
      formattedData.dueDate = dueDate;
      formattedData.taskStatus = taskStatus;
      formattedData.submittingStaffId = submittingStaffId;
      PlantTaskSchema.parse(formattedData);

      return PlantTaskDao.createPlantTask(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllPlantTasks(): Promise<PlantTask[]> {
    return PlantTaskDao.getAllPlantTasks();
  }

  public async getPlantTaskById(id: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }
    return plantTask;
  }

  public async updatePlantTask(id: string, data: Partial<PlantTaskSchemaType>): Promise<PlantTask> {
    try {
      const existingPlantTask = await PlantTaskDao.getPlantTaskById(id);
      if (!existingPlantTask) {
        throw new Error('Plant task not found');
      }

      const formattedData = dateFormatter(data);

      let mergedData = { ...existingPlantTask, ...formattedData };
      mergedData = Object.fromEntries(Object.entries(mergedData).filter(([key, value]) => value !== null));

      PlantTaskSchema.parse(mergedData);

      const updateData: Prisma.PlantTaskUpdateInput = Object.entries(formattedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return PlantTaskDao.updatePlantTask(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deletePlantTask(id: string): Promise<void> {
    await PlantTaskDao.deletePlantTask(id);
  }

  public async getPlantTasksByParkId(parkId: number): Promise<PlantTask[]> {
    return PlantTaskDao.getPlantTasksByParkId(parkId);
  }

  public async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await this.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    return uploadedUrls;
  }

  private async uploadImageToS3(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: 'lepark',
      Key: `plantTasks/${fileName}`,
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

  private calculateDueDate = (createdAt: Date, urgency: PlantTaskUrgencyEnum): Date => {
    const dueDate = new Date(createdAt);
    switch (urgency) {
      case PlantTaskUrgencyEnum.IMMEDIATE:
        // Due today (0 days)
        break;
      case PlantTaskUrgencyEnum.HIGH:
        dueDate.setDate(dueDate.getDate() + 3);
        break;
      case PlantTaskUrgencyEnum.NORMAL:
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case PlantTaskUrgencyEnum.LOW:
        dueDate.setDate(dueDate.getDate() + 14);
        break;
    }
    return dueDate;
  };
}

const dateFormatter = (data: any) => {
  const { createdAt, updatedAt, completedDate, ...rest } = data;
  const formattedData = { ...rest };

  if (createdAt) formattedData.createdAt = new Date(createdAt);
  if (updatedAt) formattedData.updatedAt = new Date(updatedAt);
  if (completedDate) formattedData.completedDate = new Date(completedDate);

  return formattedData;
};

export default new PlantTaskService();
