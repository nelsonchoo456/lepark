import { Prisma, PlantTask, PlantTaskUrgencyEnum, PlantTaskStatusEnum, Staff } from '@prisma/client';
import { z } from 'zod';
import { PlantTaskSchema, PlantTaskSchemaType } from '../schemas/plantTaskSchema';
import PlantTaskDao from '../dao/PlantTaskDao';
import OccurrenceDao from '../dao/OccurrenceDao';
import ZoneDao from '../dao/ZoneDao';
import StaffDao from '../dao/StaffDao';
import { fromZodError } from 'zod-validation-error';
import { StaffRoleEnum } from '@prisma/client';
import aws from 'aws-sdk';
import { ZoneResponseData } from '../schemas/zoneSchema';
import { ParkResponseData } from '../schemas/parkSchema';
import ParkDao from '../dao/ParkDao';
import { StaffPerformanceRankingData } from '@lepark/data-access';

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

      if (
        staff.role !== StaffRoleEnum.SUPERADMIN &&
        staff.role !== StaffRoleEnum.MANAGER &&
        staff.role !== StaffRoleEnum.BOTANIST &&
        staff.role !== StaffRoleEnum.ARBORIST
      ) {
        throw new Error('Only Superadmins, Managers, Botanists and Arborists can create plant tasks');
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
      if (!formattedData.dueDate) {
        const dueDate = this.calculateDueDate(createdAt, formattedData.taskUrgency);
        formattedData.dueDate = dueDate;
      }

      const taskStatus = PlantTaskStatusEnum.OPEN;

      formattedData.createdAt = createdAt;
      formattedData.taskStatus = taskStatus;
      formattedData.submittingStaffId = submittingStaffId;
      PlantTaskSchema.parse(formattedData);

      const maxPosition = await PlantTaskDao.getMaxPositionForStatus(taskStatus);
      formattedData.position = maxPosition + 1;

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
    const plantTasks = await PlantTaskDao.getAllPlantTasks();
    return this.addZoneAndParkInfo(plantTasks);
  }

  public async getAllPlantTasksByParkId(parkId: number): Promise<PlantTask[]> {
    const plantTasks = await PlantTaskDao.getAllPlantTasksByParkId(parkId);
    return this.addZoneAndParkInfo(plantTasks);
  }

  public async getPlantTaskById(id: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }
    return (await this.addZoneAndParkInfo([plantTask]))[0];
  }

  public async getAllAssignedPlantTasks(staffId: string): Promise<PlantTask[]> {
    const plantTasks = await PlantTaskDao.getAllAssignedPlantTasks(staffId);
    return this.addZoneAndParkInfo(plantTasks);
  }

  public async updatePlantTask(id: string, data: Partial<PlantTaskSchemaType>): Promise<PlantTask> {
    try {
      const existingPlantTask = await PlantTaskDao.getPlantTaskById(id);
      if (!existingPlantTask) {
        throw new Error('Plant task not found');
      }

      if (
        existingPlantTask.taskStatus === PlantTaskStatusEnum.COMPLETED ||
        existingPlantTask.taskStatus === PlantTaskStatusEnum.CANCELLED
      ) {
        throw new Error('Completed or cancelled tasks cannot be edited');
      }

      if (
        existingPlantTask.assignedStaffId === null &&
        (data.taskStatus === PlantTaskStatusEnum.IN_PROGRESS || data.taskStatus === PlantTaskStatusEnum.COMPLETED)
      ) {
        throw new Error('Only assigned tasks can be set to in progress or completed');
      }

      if (existingPlantTask.taskStatus !== data.taskStatus && data.taskStatus === PlantTaskStatusEnum.COMPLETED) {
        data.completedDate = new Date();
      }

      const formattedData = dateFormatter(data);
      formattedData.updatedAt = new Date(); // Add this line

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

  public async deleteTaskskByStatus(taskStatus: PlantTaskStatusEnum): Promise<void> {
    await PlantTaskDao.deleteTaskskByStatus(taskStatus);
  }

  public async assignPlantTask(id: string, assignerStaffId: string, staffId: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    const assigner = await StaffDao.getStaffById(assignerStaffId);
    if (!assigner) {
      throw new Error('Assigning staff not found');
    }

    const staff = await StaffDao.getStaffById(staffId);
    if (!staff) {
      throw new Error('Assigned staff not found');
    }

    if (assigner.role !== StaffRoleEnum.SUPERADMIN && assigner.role !== StaffRoleEnum.MANAGER) {
      throw new Error('Only Superadmins and Managers can assign tasks');
    }

    if (staff.role !== StaffRoleEnum.BOTANIST && staff.role !== StaffRoleEnum.ARBORIST) {
      throw new Error('Only Botanists and Arborists can be assigned tasks');
    }

    if (assigner.role !== StaffRoleEnum.SUPERADMIN && staff.parkId !== assigner.parkId) {
      throw new Error('Only staff in the same park can be assigned tasks');
    }

    if (plantTask.taskStatus !== PlantTaskStatusEnum.OPEN) {
      throw new Error('Only open tasks can be assigned');
    }

    const assignedStaff = await StaffDao.getStaffById(staffId);
    if (!assignedStaff) {
      throw new Error('Assigned staff not found');
    }

    return PlantTaskDao.assignPlantTask(id, assignedStaff, new Date()); // Add current date as third argument
  }

  public async unassignPlantTask(id: string, unassignerStaffId: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    if (plantTask.assignedStaffId === null) {
      throw new Error('Task is not assigned to any staff');
    }

    const unassigner = await StaffDao.getStaffById(unassignerStaffId);
    if (!unassigner) {
      throw new Error('Unassigning staff not found');
    }

    if (unassigner.role !== StaffRoleEnum.SUPERADMIN && unassigner.role !== StaffRoleEnum.MANAGER) {
      throw new Error('Only Superadmins and Managers can unassign tasks');
    }

    const assignedStaff = await StaffDao.getStaffById(plantTask.assignedStaffId);
    if (!assignedStaff) {
      throw new Error('Assigned staff not found');
    }

    if (unassigner.role !== StaffRoleEnum.SUPERADMIN && assignedStaff.parkId !== unassigner.parkId) {
      throw new Error('Only the superadmin can unassign other staffs tasks');
    }

    if (plantTask.taskStatus !== PlantTaskStatusEnum.OPEN) {
      throw new Error('Only open tasks can be unassigned');
    }

    return PlantTaskDao.unassignPlantTask(id, new Date()); // Add current date as second argument
  }

  public async completePlantTask(id: string, staffId: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    if (plantTask.taskStatus !== PlantTaskStatusEnum.IN_PROGRESS) {
      throw new Error('Only in progress tasks can be completed');
    }

    if (plantTask.assignedStaffId !== staffId) {
      throw new Error('Only the assigned staff can complete the task');
    }

    await this.updatePlantTask(id, { completedDate: new Date(), updatedAt: new Date() });

    return PlantTaskDao.completePlantTask(id, new Date()); // Add current date as second argument
  }

  public async acceptPlantTask(staffId: string, id: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    if (plantTask.taskStatus !== PlantTaskStatusEnum.OPEN) {
      throw new Error('Only open tasks can be accepted');
    }
    return PlantTaskDao.acceptPlantTask(staffId, id, new Date()); // Add current date as third argument
  }

  public async unacceptPlantTask(id: string): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    if (plantTask.taskStatus !== PlantTaskStatusEnum.IN_PROGRESS) {
      throw new Error('Only in progress tasks can be unaccepted');
    }

    return PlantTaskDao.unacceptPlantTask(id, new Date()); // Add current date as second argument
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

  private async addZoneAndParkInfo(plantTasks: PlantTask[]): Promise<PlantTask[]> {
    const enhancedPlantTasks = await Promise.all(
      plantTasks.map(async (plantTask) => {
        const occurrence = await OccurrenceDao.getOccurrenceById(plantTask.occurrenceId);
        if (!occurrence) {
          throw new Error(`Occurrence not found for plant task ${plantTask.id}`);
        }

        const zone = await ZoneDao.getZoneById(occurrence.zoneId);
        if (!zone) {
          throw new Error(`Zone not found for occurrence ${occurrence.id}`);
        }

        const park = await ParkDao.getParkById(zone.parkId);
        if (!park) {
          throw new Error(`Park not found for zone ${zone.id}`);
        }

        return {
          ...plantTask,
          occurrence: {
            ...occurrence,
            zone: {
              ...zone,
              park,
            },
          },
        };
      }),
    );

    return enhancedPlantTasks;
  }

  public async updatePlantTaskStatus(id: string, newStatus: PlantTaskStatusEnum): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    if (plantTask.taskStatus !== newStatus && newStatus === PlantTaskStatusEnum.COMPLETED) {
      await this.updatePlantTask(id, { completedDate: new Date(), updatedAt: new Date() });
    }

    const maxPosition = await PlantTaskDao.getMaxPositionForStatus(newStatus);
    const updatedTask = await PlantTaskDao.updatePlantTask(id, {
      taskStatus: newStatus,
      position: maxPosition + 1000,
      updatedAt: new Date(), // Add this line
    });

    return updatedTask;
  }

  public async updatePlantTaskPosition(id: string, newPosition: number): Promise<PlantTask> {
    const plantTask = await PlantTaskDao.getPlantTaskById(id);
    if (!plantTask) {
      throw new Error('Plant task not found');
    }

    const tasksInSameStatus = await PlantTaskDao.getPlantTasksByStatus(plantTask.taskStatus);

    // Sort tasks by position
    tasksInSameStatus.sort((a, b) => a.position - b.position);

    // Find the current index of the task being moved
    const currentIndex = tasksInSameStatus.findIndex((task) => task.id === id);
    if (currentIndex === -1) {
      throw new Error('Task not found in the current status');
    }

    // Remove the task from its current position
    const [movedTask] = tasksInSameStatus.splice(currentIndex, 1);

    // Insert the task at the new position
    tasksInSameStatus.splice(newPosition, 0, movedTask);

    // Recalculate positions for all tasks
    const updatedTasks = tasksInSameStatus.map((task, index) => ({
      id: task.id,
      position: (index + 1) * 1000,
    }));

    // Update all task positions in the database
    await Promise.all(
      updatedTasks.map((task) => PlantTaskDao.updatePlantTask(task.id, { position: task.position, updatedAt: new Date() })),
    );

    // Return the updated task
    return PlantTaskDao.getPlantTaskById(id);
  }

  public async getPlantTasksByStatus(status: PlantTaskStatusEnum): Promise<PlantTask[]> {
    return PlantTaskDao.getPlantTasksByStatus(status);
  }

  public async getParkPlantTaskCompletionRates(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ staff: Staff; completionRate: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);
    const staffTaskCompletionRates = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const completedTasks = await PlantTaskDao.getStaffCompletedTasksForPeriod(staffId, startDate, endDate);
        const totalTasks = await PlantTaskDao.getStaffTotalTasksForPeriod(staffId, startDate, endDate);
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        return { staff, completionRate };
      }),
    );
    return staffTaskCompletionRates;
  }

  public async getParkPlantTaskOverdueRates(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ staff: Staff; overdueRate: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);
    const staffOverdueRates = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const overdueTasks = await PlantTaskDao.getStaffOverdueTasksForPeriod(staffId, startDate, endDate);
        const totalTasks = await PlantTaskDao.getStaffTotalTasksDueForPeriod(staffId, startDate, endDate);
        const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
        return { staff, overdueRate };
      }),
    );
    return staffOverdueRates;
  }

  public async getParkAverageTaskCompletionTime(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ staff: Staff; averageCompletionTime: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);
    const staffAverageCompletionTimes = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const averageCompletionTime = await PlantTaskDao.getStaffAverageTaskCompletionTime(staffId, startDate, endDate);
        return { staff, averageCompletionTime };
      }),
    );

    return staffAverageCompletionTimes;
  }

  public async getParkTaskLoadPercentage(parkId: number): Promise<{ staff: Staff; taskLoadPercentage: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);
    const staffTaskLoadPercentages = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const tasks = await PlantTaskDao.getAllAssignedPlantTasksThatAreOpenOrInProgressByStaffId(staffId);
        const totalTasks = await PlantTaskDao.getAllAssignedPlantTasksThatAreOpenOrInProgressByParkId(parkId);
        const taskLoadPercentage = totalTasks.length > 0 ? (tasks.length / totalTasks.length) * 100 : 0;
        return { staff, taskLoadPercentage };
      }),
    );
    return staffTaskLoadPercentages;
  }

  public async getParkTaskCompleted(parkId: number, startDate: Date, endDate: Date): Promise<{ staff: Staff; taskCompleted: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);
    const staffTasksCompleted = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const taskCompleted = await PlantTaskDao.getStaffCompletedTasksForPeriod(staffId, startDate, endDate);
        return { staff, taskCompleted };
      }),
    );

    return staffTasksCompleted;
  }

  public async getStaffPerformanceRanking(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ bestPerformer: Staff; secondBestPerformer: Staff; thirdBestPerformer: Staff; message: string | null }> {
    const completionRates = await this.getParkPlantTaskCompletionRates(parkId, startDate, endDate);
    const overdueRates = await this.getParkPlantTaskOverdueRates(parkId, startDate, endDate);
    const avgCompletionTimes = await this.getParkAverageTaskCompletionTime(parkId, startDate, endDate);
    const completedTasks = await this.getParkTaskCompleted(parkId, startDate, endDate);

    const staffPerformance = completionRates.map(({ staff, completionRate }) => {
      const overdue = overdueRates.find((o) => o.staff.id === staff.id)?.overdueRate || 0;
      const avgTime = avgCompletionTimes.find((a) => a.staff.id === staff.id)?.averageCompletionTime || 0;
      const tasksCompleted = completedTasks.find((c) => c.staff.id === staff.id)?.taskCompleted || 0;

      // Calculate a performance score
      // Higher completion rate is better
      // Lower overdue rate is better
      // Lower average completion time is better
      // Higher task load is considered better (more productive)
      const performanceScore = completionRate * 0.25 + (100 - overdue) * 0.25 + (100 - avgTime) * 0.25 + tasksCompleted * 0.25;

      return { staff, performanceScore };
    });

    // Sort by performance score in descending order
    staffPerformance.sort((a, b) => b.performanceScore - a.performanceScore);

    if (staffPerformance.length === 0) {
      throw new Error('No staff performance data available');
    }

    const bestPerformer = staffPerformance[0];
    const secondBestPerformer = staffPerformance[1];
    const thirdBestPerformer = staffPerformance[2];

    return {
      bestPerformer: bestPerformer.staff,
      secondBestPerformer: secondBestPerformer.staff,
      thirdBestPerformer: thirdBestPerformer.staff,
      message: null,
    };
  }

  public async getParkStaffAverageCompletionTimeForPastMonths(
    parkId: number,
    months: number,
  ): Promise<{ staff: Staff; averageCompletionTimes: number[] }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);

    const currentDate = new Date();

    const staffAverageCompletionTimes = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }

        const monthlyAverages = [];
        for (let i = 0; i < months; i++) {
          const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
          monthEndDate.setHours(23, 59, 59, 999);

          const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          monthStartDate.setHours(0, 0, 0, 0);

          const averageCompletionTime = await PlantTaskDao.getStaffAverageTaskCompletionTime(staffId, monthStartDate, monthEndDate);
          monthlyAverages.unshift(averageCompletionTime);
        }

        return { staff, averageCompletionTimes: monthlyAverages };
      }),
    );

    return staffAverageCompletionTimes;
  }

  public async getParkStaffCompletionRatesForPastMonths(
    parkId: number,
    months: number,
  ): Promise<{ staff: Staff; completionRates: number[] }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);

    const currentDate = new Date();

    const staffCompletionRates = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }

        const monthlyCompletionRates = [];
        for (let i = 0; i < months; i++) {
          const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
          monthEndDate.setHours(23, 59, 59, 999);

          const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          monthStartDate.setHours(0, 0, 0, 0);

          const completedTasks = await PlantTaskDao.getStaffCompletedTasksForPeriod(staffId, monthStartDate, monthEndDate);
          const totalTasks = await PlantTaskDao.getStaffTotalTasksForPeriod(staffId, monthStartDate, monthEndDate);
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          monthlyCompletionRates.unshift(completionRate);
        }

        return { staff, completionRates: monthlyCompletionRates };
      }),
    );

    return staffCompletionRates;
  }

  public async getParkStaffOverdueRatesForPastMonths(parkId: number, months: number): Promise<{ staff: Staff; overdueRates: number[] }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);

    const currentDate = new Date();

    const staffOverdueRates = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }

        const monthlyOverdueRates = [];
        for (let i = 0; i < months; i++) {
          const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
          monthEndDate.setHours(23, 59, 59, 999);

          const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          monthStartDate.setHours(0, 0, 0, 0);

          const overdueTasks = await PlantTaskDao.getStaffOverdueTasksForPeriod(staffId, monthStartDate, monthEndDate);
          const totalTasks = await PlantTaskDao.getStaffTotalTasksDueForPeriod(staffId, monthStartDate, monthEndDate);
          const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
          monthlyOverdueRates.unshift(overdueRate);
        }

        return { staff, overdueRates: monthlyOverdueRates };
      }),
    );

    return staffOverdueRates;
  }

  public async getParkStaffTasksCompletedForPastMonths(
    parkId: number,
    months: number,
  ): Promise<{ staff: Staff; tasksCompleted: number[] }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds
      .filter((staff) => staff.role === StaffRoleEnum.BOTANIST || staff.role === StaffRoleEnum.ARBORIST)
      .map((staff) => staff.id);

    const currentDate = new Date();

    const staffTasksCompleted = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }

        const monthlyTasksCompleted = [];
        for (let i = 0; i < months; i++) {
          const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
          monthEndDate.setHours(23, 59, 59, 999);

          const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          monthStartDate.setHours(0, 0, 0, 0);

          const tasksCompleted = await PlantTaskDao.getStaffCompletedTasksForPeriod(staffId, monthStartDate, monthEndDate);
          monthlyTasksCompleted.unshift(tasksCompleted);
        }

        return { staff, tasksCompleted: monthlyTasksCompleted };
      }),
    );

    return staffTasksCompleted;
  }
}

const dateFormatter = (data: any) => {
  const { createdAt, updatedAt, completedDate, dueDate, ...rest } = data;
  const formattedData = { ...rest };

  if (createdAt) formattedData.createdAt = new Date(createdAt);
  if (updatedAt) formattedData.updatedAt = new Date(updatedAt);
  if (dueDate) formattedData.dueDate = new Date(dueDate);
  if (completedDate) formattedData.completedDate = new Date(completedDate);

  return formattedData;
};

export default new PlantTaskService();