import { Prisma, MaintenanceTask, MaintenanceTaskUrgencyEnum, MaintenanceTaskStatusEnum, Staff, PlantTaskStatusEnum, MaintenanceTaskTypeEnum } from '@prisma/client';
import { z } from 'zod';
import { MaintenanceTaskSchema, MaintenanceTaskSchemaType } from '../schemas/maintenanceTaskSchema';
import MaintenanceTaskDao from '../dao/MaintenanceTaskDao';
import StaffDao from '../dao/StaffDao';
import FacilityDao from '../dao/FacilityDao';
import ParkAssetDao from '../dao/ParkAssetDao';
import SensorDao from '../dao/SensorDao';
import HubDao from '../dao/HubDao';
import { fromZodError } from 'zod-validation-error';
import { StaffRoleEnum } from '@prisma/client';
import aws from 'aws-sdk';
import ParkDao from '../dao/ParkDao';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

class MaintenanceTaskService {
  public async createMaintenanceTask(data: MaintenanceTaskSchemaType, submittingStaffId: string): Promise<MaintenanceTask> {
    try {
      const staff = await StaffDao.getStaffById(submittingStaffId);
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Ensure only one of facility, parkAsset, sensor, or hub is provided
      const entityCount = [data.facilityId, data.parkAssetId, data.sensorId, data.hubId].filter(Boolean).length;
      if (entityCount !== 1) {
        throw new Error('Exactly one of facilityId, parkAssetId, sensorId, or hubId must be provided');
      }

      if (data.facilityId) {
        const facility = await FacilityDao.getFacilityById(data.facilityId);
        if (!facility) {
          throw new Error('Facility not found');
        }
      }

      if (data.parkAssetId) {
        const parkAsset = await ParkAssetDao.getParkAssetById(data.parkAssetId);
        if (!parkAsset) {
          throw new Error('Park asset not found');
        }
      }

      if (data.sensorId) {
        const sensor = await SensorDao.getSensorById(data.sensorId);
        if (!sensor) {
          throw new Error('Sensor not found');
        }
      }

      if (data.hubId) {
        const hub = await HubDao.getHubById(data.hubId);
        if (!hub) {
          throw new Error('Hub not found');
        }
      }

      if (staff.role !== StaffRoleEnum.SUPERADMIN) {
        if (data.facilityId) {
          const facility = await FacilityDao.getFacilityById(data.facilityId);
          if (facility && facility.parkId !== staff.parkId) {
            throw new Error('Staff can only create tasks for their assigned park');
          }
        }

        if (data.parkAssetId) {
          const parkAsset = await ParkAssetDao.getParkAssetById(data.parkAssetId);
          if (parkAsset) {
            const facility = await FacilityDao.getFacilityById(parkAsset.facilityId);
            if (facility && facility.parkId !== staff.parkId) {
              throw new Error('Staff can only create tasks for their assigned park');
            }
          }
        }

        if (data.sensorId) {
          const sensor = await SensorDao.getSensorById(data.sensorId);
          if (sensor && sensor.facilityId) {
            const facility = await FacilityDao.getFacilityById(sensor.facilityId);
            if (facility && facility.parkId !== staff.parkId) {
              throw new Error('Staff can only create tasks for their assigned park');
            }
          }
        }

        if (data.hubId) {
          const hub = await HubDao.getHubById(data.hubId);
          if (hub && hub.facilityId) {
            const facility = await FacilityDao.getFacilityById(hub.facilityId);
            if (facility && facility.parkId !== staff.parkId) {
              throw new Error('Staff can only create tasks for their assigned park');
            }
          }
        }
      }

      const formattedData = dateFormatter(data);

      // Calculate due date based on urgency
      const createdAt = new Date();
      if (!formattedData.dueDate) {
        const dueDate = this.calculateDueDate(createdAt, formattedData.taskUrgency);
        formattedData.dueDate = dueDate;
      }

      const taskStatus = MaintenanceTaskStatusEnum.OPEN;

      formattedData.createdAt = createdAt;
      formattedData.taskStatus = taskStatus;
      formattedData.submittingStaffId = submittingStaffId;
      MaintenanceTaskSchema.parse(formattedData);

      const maxPosition = await MaintenanceTaskDao.getMaxPositionForStatus(taskStatus);
      formattedData.position = maxPosition + 1;

      return MaintenanceTaskDao.createMaintenanceTask(formattedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllMaintenanceTasks(): Promise<MaintenanceTask[]> {
    const maintenanceTasks = await MaintenanceTaskDao.getAllMaintenanceTasks();
    return this.addFacilityInfo(maintenanceTasks);
  }

  public async getMaintenanceTasksByParkId(parkId: number): Promise<MaintenanceTask[]> {
    const maintenanceTasks = await MaintenanceTaskDao.getMaintenanceTasksByParkId(parkId);
    return this.addFacilityInfo(maintenanceTasks);
  }

  public async getMaintenanceTaskById(id: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }
    return (await this.addFacilityInfo([maintenanceTask]))[0];
  }

  public async getAllMaintenanceTasksByStaffId(staffId: string): Promise<MaintenanceTask[]> {
    const maintenanceTasks = await MaintenanceTaskDao.getAllMaintenanceTasksByStaffId(staffId);
    return this.addFacilityInfo(maintenanceTasks);
  }

  public async getMaintenanceTasksBySubmittingStaff(staffId: string): Promise<MaintenanceTask[]> {
    const maintenanceTasks = await MaintenanceTaskDao.getMaintenanceTasksBySubmittingStaff(staffId);
    return this.addFacilityInfo(maintenanceTasks);
  } 

  public async updateMaintenanceTask(id: string, data: Partial<MaintenanceTaskSchemaType>): Promise<MaintenanceTask> {
    try {
      const existingMaintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
      if (!existingMaintenanceTask) {
        throw new Error('Maintenance task not found');
      }

      if (
        existingMaintenanceTask.taskStatus === MaintenanceTaskStatusEnum.COMPLETED ||
        existingMaintenanceTask.taskStatus === MaintenanceTaskStatusEnum.CANCELLED
      ) {
        throw new Error('Completed or cancelled tasks cannot be edited');
      }

      // Ensure only one of facility, parkAsset, sensor, or hub is provided
      const entityCount = [data.facilityId, data.parkAssetId, data.sensorId, data.hubId].filter(Boolean).length;
      if (entityCount > 1) {
        throw new Error('Only one of facilityId, parkAssetId, sensorId, or hubId can be provided');
      }

      if (
        existingMaintenanceTask.taskStatus === MaintenanceTaskStatusEnum.OPEN &&
        data.taskStatus === MaintenanceTaskStatusEnum.IN_PROGRESS &&
        data.assignedStaffId === null
      ) {
        throw new Error('Only assigned tasks can be set to in progress');
      }

      if (
        (existingMaintenanceTask.assignedStaffId === null || existingMaintenanceTask.taskStatus === MaintenanceTaskStatusEnum.OPEN) &&
        data.taskStatus === MaintenanceTaskStatusEnum.COMPLETED
      ) {
        throw new Error('Only assigned tasks can be set to completed');
      }

      if (existingMaintenanceTask.taskStatus !== data.taskStatus && data.taskStatus === MaintenanceTaskStatusEnum.COMPLETED) {
        data.completedDate = new Date();
      }

      const formattedData = dateFormatter(data);
      formattedData.updatedAt = new Date();

      let mergedData = { ...existingMaintenanceTask, ...formattedData };
      mergedData = Object.fromEntries(Object.entries(mergedData).filter(([key, value]) => value !== null));

      MaintenanceTaskSchema.parse(mergedData);

      const updateData: Prisma.MaintenanceTaskUpdateInput = Object.entries(formattedData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return MaintenanceTaskDao.updateMaintenanceTask(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async deleteMaintenanceTask(id: string): Promise<void> {
    await MaintenanceTaskDao.deleteMaintenanceTask(id);
  }

  public async deleteMaintenanceTasksByStatus(taskStatus: MaintenanceTaskStatusEnum): Promise<void> {
    await MaintenanceTaskDao.deleteMaintenanceTasksByStatus(taskStatus);
  }

  public async assignMaintenanceTask(id: string, staffId: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    const staff = await StaffDao.getStaffById(staffId);
    if (!staff) {
      throw new Error('Staff taking the task not found');
    }

    if (maintenanceTask.taskStatus !== MaintenanceTaskStatusEnum.OPEN) {
      throw new Error('Only open tasks can be taken');
    }

    return MaintenanceTaskDao.assignMaintenanceTask(id, staff, new Date());
  }

  public async unassignMaintenanceTask(id: string, unassignerStaffId: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    if (maintenanceTask.assignedStaffId === null) {
      throw new Error('Task is not assigned to any staff');
    }

    const unassigner = await StaffDao.getStaffById(unassignerStaffId);
    if (!unassigner) {
      throw new Error('Staff returning the task not found');
    }

    if (unassigner.id !== maintenanceTask.assignedStaffId) {
      throw new Error('Only the assigned staff can unassign the task');
    }

    return MaintenanceTaskDao.unassignMaintenanceTask(id, new Date());
  }

  public async acceptMaintenanceTask(id: string, staffId: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    if (maintenanceTask.taskStatus !== MaintenanceTaskStatusEnum.OPEN) {
      throw new Error('Only open tasks can be accepted');
    }

    return MaintenanceTaskDao.acceptMaintenanceTask(id, staffId, new Date());
  }

  public async unacceptMaintenanceTask(id: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    if (maintenanceTask.taskStatus !== MaintenanceTaskStatusEnum.IN_PROGRESS) {
      throw new Error('Only in progress tasks can be unaccepted');
    }

    return MaintenanceTaskDao.unacceptMaintenanceTask(id, new Date());
  }

  public async completeMaintenanceTask(id: string, staffId: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    if (maintenanceTask.taskStatus !== MaintenanceTaskStatusEnum.IN_PROGRESS) {
      throw new Error('Only in progress tasks can be completed');
    }

    if (maintenanceTask.assignedStaffId !== staffId) {
      throw new Error('Only the assigned staff can complete the task');
    }

    return MaintenanceTaskDao.updateMaintenanceTask(id, {
      taskStatus: MaintenanceTaskStatusEnum.COMPLETED,
      completedDate: new Date(),
      updatedAt: new Date(),
    });
  }

  public async updateMaintenanceTaskStatus(id: string, newStatus: MaintenanceTaskStatusEnum, staffId?: string): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    if (newStatus === MaintenanceTaskStatusEnum.IN_PROGRESS && maintenanceTask.assignedStaffId === null && staffId) {
      await this.assignMaintenanceTask(id, staffId);
    }

    const tasksInNewStatus = await MaintenanceTaskDao.getMaintenanceTasksByStatus(newStatus);
    let newPosition: number;

    if (tasksInNewStatus.length === 0) {
      newPosition = 1000; // First task in this status
    } else {
      // Add to the end of the list
      newPosition = tasksInNewStatus[tasksInNewStatus.length - 1].position + 1000;
    }

    let updatedTask: MaintenanceTask;
    if (newStatus === MaintenanceTaskStatusEnum.COMPLETED) {
      if (!maintenanceTask.assignedStaffId) {
        throw new Error('Only assigned tasks can be completed');
      }
      updatedTask = await MaintenanceTaskDao.updateMaintenanceTask(id, {
        taskStatus: newStatus,
        position: newPosition,
        completedDate: new Date(),
        updatedAt: new Date(),
      });
    } else {
      updatedTask = await MaintenanceTaskDao.updateMaintenanceTask(id, {
        taskStatus: newStatus,
        position: newPosition,
        updatedAt: new Date(),
      });
    }

    return updatedTask;
  }

  public async updateMaintenanceTaskPosition(id: string, newPosition: number): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    const tasksInSameStatus = await MaintenanceTaskDao.getMaintenanceTasksByStatus(maintenanceTask.taskStatus);

    tasksInSameStatus.sort((a, b) => a.position - b.position);

    let newPositionValue: number;

    if (newPosition === 0) {
      // If moving to the start, set position to half of the first task's position
      newPositionValue = tasksInSameStatus[0].position / 2;
    } else if (newPosition >= tasksInSameStatus.length) {
      // If moving to the end, set position to last task's position + 1000
      newPositionValue = tasksInSameStatus[tasksInSameStatus.length - 1].position + 1000;
    } else {
      // Calculate the middle position between the two tasks
      const prevTaskPosition = tasksInSameStatus[newPosition - 1].position;
      const nextTaskPosition = tasksInSameStatus[newPosition].position;
      newPositionValue = (prevTaskPosition + nextTaskPosition) / 2;
    }

    // Update the task's position
    const updatedTask = await MaintenanceTaskDao.updateMaintenanceTask(id, {
      position: newPositionValue,
      updatedAt: new Date(),
    });

    if (!updatedTask) {
      throw new Error('Updated task not found');
    }

    return updatedTask;
  }

  public async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

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
      Key: `maintenanceTasks/${fileName}`,
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

  private calculateDueDate = (createdAt: Date, urgency: MaintenanceTaskUrgencyEnum): Date => {
    const dueDate = new Date(createdAt);
    switch (urgency) {
      case MaintenanceTaskUrgencyEnum.IMMEDIATE:
        // Due today (0 days)
        break;
      case MaintenanceTaskUrgencyEnum.HIGH:
        dueDate.setDate(dueDate.getDate() + 3);
        break;
      case MaintenanceTaskUrgencyEnum.NORMAL:
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case MaintenanceTaskUrgencyEnum.LOW:
        dueDate.setDate(dueDate.getDate() + 14);
        break;
    }
    return dueDate;
  };

  private async addFacilityInfo(maintenanceTasks: MaintenanceTask[]): Promise<MaintenanceTask[]> {
    const enhancedMaintenanceTasks = await Promise.all(
      maintenanceTasks.map(async (maintenanceTask) => {
        let facility;
        let park;
        if (maintenanceTask.facilityId) {
          facility = await FacilityDao.getFacilityById(maintenanceTask.facilityId);
          if (!facility) {
            throw new Error(`Facility not found for maintenance task ${maintenanceTask.id}`);
          }
          park = await ParkDao.getParkById(facility.parkId);
        }

        if (maintenanceTask.parkAssetId) {
          const parkAsset = await ParkAssetDao.getParkAssetById(maintenanceTask.parkAssetId);
          if (!parkAsset) {
            throw new Error(`Park asset not found for maintenance task ${maintenanceTask.id}`);
          }
          facility = await FacilityDao.getFacilityById(parkAsset.facilityId);
          if (!facility) {
            throw new Error(`Facility not found for park asset ${parkAsset.id}`);
          }
          park = await ParkDao.getParkById(facility.parkId);
        }

        if (maintenanceTask.sensorId) {
          const sensor = await SensorDao.getSensorById(maintenanceTask.sensorId);
          if (!sensor) {
            throw new Error(`Sensor not found for maintenance task ${maintenanceTask.id}`);
          }
          if (sensor.facilityId) {
            facility = await FacilityDao.getFacilityById(sensor.facilityId);
            if (!facility) {
              throw new Error(`Facility not found for sensor ${sensor.id}`);
            }
            park = await ParkDao.getParkById(facility.parkId);
          }
        }

        if (maintenanceTask.hubId) {
          const hub = await HubDao.getHubById(maintenanceTask.hubId);
          if (!hub) {
            throw new Error(`Hub not found for maintenance task ${maintenanceTask.id}`);
          }
          if (hub.facilityId) {
            facility = await FacilityDao.getFacilityById(hub.facilityId);
            if (!facility) {
              throw new Error(`Facility not found for hub ${hub.id}`);
            }
            park = await ParkDao.getParkById(facility.parkId);
          }
        }
        console.log("Park:", park);

        return {
          ...maintenanceTask,
          facilityOfFaultyEntity: {
            ...facility,
            park: park,
          },
        };
      }),
    );

    return enhancedMaintenanceTasks;
  }

  public async getParkMaintenanceTaskAverageCompletionTimeForPeriod(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ taskType: MaintenanceTaskTypeEnum; averageCompletionTime: number }[]> {

    const taskCompletionTimes = await Promise.all(
      Object.values(MaintenanceTaskTypeEnum).map(async (taskType) => {
        const averageCompletionTime = await MaintenanceTaskDao.getAverageTaskTypeCompletionTime(taskType, parkId, startDate, endDate);
        return { taskType, averageCompletionTime };
      }),
    );
    return taskCompletionTimes;
  }

  public async getParkMaintenanceTaskOverdueRateForPeriod(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ taskType: MaintenanceTaskTypeEnum; overdueRate: number }[]> {

    const overdueRates = await Promise.all(
      Object.values(MaintenanceTaskTypeEnum).map(async (taskType) => {
        const overdueRate = await MaintenanceTaskDao.getOverdueRateByTaskTypeForPeriod(taskType, parkId, startDate, endDate);
        return { taskType, overdueRate };
      }),
    );
    return overdueRates;
  }

  public async getCriticalTaskTypesIdentification(
    parkId: number,
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    const averageCompletionTimes = await this.getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId, startDate, endDate);
    const overdueRates = await this.getParkMaintenanceTaskOverdueRateForPeriod(parkId, startDate, endDate);

    const criticalTasks = averageCompletionTimes.map(completionTime => {
      const overdueRate = overdueRates.find(rate => rate.taskType === completionTime.taskType)?.overdueRate || 0;
      return {
        taskType: completionTime.taskType,
        score: completionTime.averageCompletionTime * overdueRate
      };
    }).sort((a, b) => b.score - a.score);

    return criticalTasks.slice(0, 3).map((task, index) => 
      `${index + 1}. ${task.taskType} tasks require attention due to their combination of long completion times and high overdue rates.`
    );
  }

  public async getTaskTypeEfficiencyRanking(
    parkId: number,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const averageCompletionTimes = await this.getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId, startDate, endDate);
    const sortedTasks = averageCompletionTimes.sort((a, b) => a.averageCompletionTime - b.averageCompletionTime);

    const ranking = sortedTasks.map((item, index) => `${index + 1}. ${item.taskType}`).join(', ');
    return `Task type efficiency ranking (from most efficient to least): ${ranking}`;
  }

  public async getTrendAnalysis(
    parkId: number,
    startDate: Date,
    endDate: Date,
    previousStartDate: Date,
    previousEndDate: Date
  ): Promise<string[]> {
    const currentPeriod = await this.getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId, startDate, endDate);
    const previousPeriod = await this.getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId, previousStartDate, previousEndDate);

    return currentPeriod.map(current => {
      const previous = previousPeriod.find(item => item.taskType === current.taskType);
      if (!previous) return `No previous data available for ${current.taskType} tasks.`;

      const percentChange = ((current.averageCompletionTime - previous.averageCompletionTime) / previous.averageCompletionTime) * 100;
      if (Math.abs(percentChange) < 5) {
        return `${current.taskType} task completion time remained stable compared to the previous period.`;
      } else if (percentChange > 0) {
        return `${current.taskType} tasks are taking ${percentChange.toFixed(0)}% longer to complete compared to the previous period.`;
      } else {
        return `${current.taskType} tasks are being completed ${Math.abs(percentChange).toFixed(0)}% faster compared to the previous period.`;
      }
    });
  }

  public async getOverdueRateAnalysis(
    parkId: number,
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    const overdueRates = await this.getParkMaintenanceTaskOverdueRateForPeriod(parkId, startDate, endDate);
    const overallOverdueRate = overdueRates.reduce((sum, item) => sum + item.overdueRate, 0) / overdueRates.length;

    return overdueRates.map(item => {
      if (item.overdueRate > overallOverdueRate * 1.5) {
        return `${item.taskType} tasks have a significantly higher overdue rate (${(item.overdueRate * 100).toFixed(1)}%) compared to the average.`;
      } else if (item.overdueRate < overallOverdueRate * 0.5) {
        return `${item.taskType} tasks have a notably lower overdue rate (${(item.overdueRate * 100).toFixed(1)}%) compared to the average.`;
      } else {
        return `${item.taskType} tasks have an overdue rate of ${(item.overdueRate * 100).toFixed(1)}%, close to the overall average.`;
      }
    });
  }

  public async getTaskTypeComparisonAnalysis(
    parkId: number,
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    const averageCompletionTimes = await this.getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId, startDate, endDate);
    const overallAverage = averageCompletionTimes.reduce((sum, item) => sum + item.averageCompletionTime, 0) / averageCompletionTimes.length;

    return averageCompletionTimes.map(item => {
      const percentDifference = ((item.averageCompletionTime - overallAverage) / overallAverage) * 100;
      if (Math.abs(percentDifference) < 10) {
        return `${item.taskType} tasks took about the same time as the average.`;
      } else if (percentDifference > 0) {
        return `${item.taskType} tasks took ${percentDifference.toFixed(0)}% longer than the average.`;
      } else {
        return `${item.taskType} tasks were completed ${Math.abs(percentDifference).toFixed(0)}% faster than the average.`;
      }
    });
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

export default new MaintenanceTaskService();
