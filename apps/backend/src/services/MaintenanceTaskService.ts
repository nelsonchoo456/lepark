import { Prisma, MaintenanceTask, MaintenanceTaskUrgencyEnum, MaintenanceTaskStatusEnum, Staff, PlantTaskStatusEnum } from '@prisma/client';
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

      if (staff.role !== StaffRoleEnum.SUPERADMIN && staff.role !== StaffRoleEnum.MANAGER && staff.role !== StaffRoleEnum.VENDOR_MANAGER) {
        throw new Error('Only Superadmins and Managers can create maintenance tasks');
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

    const maxPosition = await MaintenanceTaskDao.getMaxPositionForStatus(newStatus);
    const updateData: any = {
      taskStatus: newStatus,
      position: maxPosition + 1000,
      updatedAt: new Date(),
    };

    if (newStatus === MaintenanceTaskStatusEnum.COMPLETED) {
      if (!maintenanceTask.assignedStaffId) {
        throw new Error('Only assigned tasks can be completed');
      }
      updateData.completedDate = new Date();
    }

    return MaintenanceTaskDao.updateMaintenanceTask(id, updateData);
  }

  public async updateMaintenanceTaskPosition(id: string, newPosition: number): Promise<MaintenanceTask> {
    const maintenanceTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
    if (!maintenanceTask) {
      throw new Error('Maintenance task not found');
    }

    const tasksInSameStatus = await MaintenanceTaskDao.getMaintenanceTasksByStatus(maintenanceTask.taskStatus);

    tasksInSameStatus.sort((a, b) => a.position - b.position);

    const currentIndex = tasksInSameStatus.findIndex((task) => task.id === id);
    if (currentIndex === -1) {
      throw new Error('Task not found in the current status');
    }

    const [movedTask] = tasksInSameStatus.splice(currentIndex, 1);
    tasksInSameStatus.splice(newPosition, 0, movedTask);

    const updatedTasks = tasksInSameStatus.map((task, index) => ({
      id: task.id,
      position: (index + 1) * 1000,
    }));

    await Promise.all(
      updatedTasks.map((task) => MaintenanceTaskDao.updateMaintenanceTask(task.id, { position: task.position, updatedAt: new Date() })),
    );

    const updatedTask = await MaintenanceTaskDao.getMaintenanceTaskById(id);
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
        if (maintenanceTask.facilityId) {
          facility = await FacilityDao.getFacilityById(maintenanceTask.facilityId);
          if (!facility) {
            throw new Error(`Facility not found for maintenance task ${maintenanceTask.id}`);
          }
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
          }
        }

        return {
          ...maintenanceTask,
          facility,
        };
      }),
    );

    return enhancedMaintenanceTasks;
  }

  public async getParkMaintenanceTaskCompletionRates(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ staff: Staff; completionRate: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds.map((staff) => staff.id);
    const staffTaskCompletionRates = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const completedTasks = await MaintenanceTaskDao.getStaffCompletedTasksForPeriod(staffId, startDate, endDate);
        const totalTasks = await MaintenanceTaskDao.getStaffTotalTasksForPeriod(staffId, startDate, endDate);
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        return { staff, completionRate };
      }),
    );
    return staffTaskCompletionRates;
  }

  public async getParkMaintenanceTaskOverdueRates(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ staff: Staff; overdueRate: number }[]> {
    const staffIds = await StaffDao.getAllStaffsByParkId(parkId);
    const staffIdsArray = staffIds.map((staff) => staff.id);
    const staffOverdueRates = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const overdueTasks = await MaintenanceTaskDao.getStaffOverdueTasksForPeriod(staffId, startDate, endDate);
        const totalTasks = await MaintenanceTaskDao.getStaffTotalTasksDueForPeriod(staffId, startDate, endDate);
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
    const staffIdsArray = staffIds.map((staff) => staff.id);
    const staffAverageCompletionTimes = await Promise.all(
      staffIdsArray.map(async (staffId) => {
        const staff = await StaffDao.getStaffById(staffId);
        if (!staff) {
          throw new Error('Staff not found');
        }
        const averageCompletionTime = await MaintenanceTaskDao.getStaffAverageTaskCompletionTime(staffId, startDate, endDate);
        return { staff, averageCompletionTime };
      }),
    );

    return staffAverageCompletionTimes;
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
