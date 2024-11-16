import { PrismaClient, Prisma, MaintenanceTask, Staff, MaintenanceTaskStatusEnum, MaintenanceTaskTypeEnum } from '@prisma/client';

const prisma = new PrismaClient();

class MaintenanceTaskDao {
  public async createMaintenanceTask(
    data: Prisma.MaintenanceTaskCreateInput
  ): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.create({ data });
  }

  public async getAllMaintenanceTasks(): Promise<MaintenanceTask[]> {
    return prisma.maintenanceTask.findMany({
      include: {
        assignedStaff: true,
        submittingStaff: true,
        facility: true,
        parkAsset: true,
        sensor: true,
        hub: true,
      },
    });
  }

  public async getMaintenanceTaskById(
    id: string
  ): Promise<MaintenanceTask | null> {
    return prisma.maintenanceTask.findUnique({
      where: { id },
      include: {
        assignedStaff: true,
        submittingStaff: true,
        facility: true,
        parkAsset: true,
        sensor: true,
        hub: true,
      },
    });
  }

  public async getAllMaintenanceTasksByStaffId(staffId: string): Promise<MaintenanceTask[]> {
    return prisma.maintenanceTask.findMany({
      where: { assignedStaffId: staffId },
    });
  }

  public async getTaskCountsByType(
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ taskType: MaintenanceTaskTypeEnum; count: number }[]> {
    const result = await prisma.maintenanceTask.groupBy({
      by: ['taskType'],
      where: { submittingStaff: { parkId: parkId }, createdAt: { gte: startDate, lte: endDate } },
      _count: { id: true },
    });

    return result.map((item) => ({
      taskType: item.taskType,
      count: item._count.id,
    }));
  }

  public async updateMaintenanceTask(
    id: string, 
    data: Prisma.MaintenanceTaskUpdateInput
  ): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({ where: { id }, data });
  }

  public async deleteMaintenanceTask(
    id: string
  ): Promise<void> {
    await prisma.maintenanceTask.delete({ where: { id } });
  }

  public async deleteMaintenanceTasksByStatus(
    taskStatus: MaintenanceTaskStatusEnum
  ): Promise<void> {
    await prisma.maintenanceTask.deleteMany({ where: { taskStatus } });
  }

  public async assignMaintenanceTask(
    id: string, 
    assignedStaff: Staff, 
    updatedAt: Date
  ): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({
      where: { id },
      data: { 
        taskStatus: MaintenanceTaskStatusEnum.IN_PROGRESS, 
        assignedStaffId: assignedStaff.id, 
        updatedAt: updatedAt 
      },
    });
  }

  public async unassignMaintenanceTask(
    id: string, 
    updatedAt: Date
  ): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({
      where: { id },
      data: { 
        taskStatus: MaintenanceTaskStatusEnum.OPEN, 
        assignedStaffId: null, 
        updatedAt: updatedAt 
      },
    });
  }

  public async getMaintenanceTasksByStatus(
    status: MaintenanceTaskStatusEnum
  ): Promise<MaintenanceTask[]> {
    return prisma.maintenanceTask.findMany({
      where: { taskStatus: status },
      orderBy: { position: 'asc' },
      include: {
        assignedStaff: true,
        submittingStaff: true,
        facility: true,
        parkAsset: true,
        sensor: true,
        hub: true,
      },
    });
  }

  public async getMaintenanceTasksBySubmittingStaff(staffId: string): Promise<MaintenanceTask[]> {
    return prisma.maintenanceTask.findMany({
      where: { submittingStaffId: staffId },
      include: {
        assignedStaff: true,
        submittingStaff: true,
        facility: true,
        parkAsset: true,
        sensor: true,
        hub: true,
      },
    });
  }

  public async getMaxPositionForStatus(status: MaintenanceTaskStatusEnum): Promise<number> {
    const result = await prisma.maintenanceTask.aggregate({
      where: { taskStatus: status },
      _max: { position: true },
    });
    return result._max.position || 0;
  }

  public async updatePositions(tasks: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      tasks.map((task) =>
        prisma.maintenanceTask.update({
          where: { id: task.id },
          data: { position: task.position },
        }),
      ),
    );
  }

  public async getMaintenanceTasksByParkId(parkId: number): Promise<MaintenanceTask[]> {
    return prisma.maintenanceTask.findMany({
      where: {
        OR: [
          { facility: { parkId } },
          { parkAsset: { facility: { parkId } } },
          { sensor: { facility: { parkId } } },
          { hub: { facility: { parkId } } },
        ],
      },
      include: {
        assignedStaff: true,
        submittingStaff: true,
        facility: true,
        parkAsset: true,
        sensor: true,
        hub: true,
      },
    });
  }

  public async getAverageTaskTypeCompletionTime(
    taskType: MaintenanceTaskTypeEnum,
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const tasks = await prisma.maintenanceTask.findMany({
      where: {
        submittingStaff: { parkId: parkId },
        taskType: taskType,
        taskStatus: MaintenanceTaskStatusEnum.COMPLETED,
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (tasks.length === 0) {
      return 0; // Return 0 if no tasks are found
    }

    const totalCompletionTime = tasks.reduce((sum, task) => {
      const completionTime = task.completedDate ? task.completedDate.getTime() - task.createdAt.getTime() : 0;
      return sum + completionTime / (1000 * 60 * 60 * 24); // in days
    }, 0);

    return totalCompletionTime / tasks.length;
  }

  public async getCompletedMaintenanceTasksByEntityId(entityId: string, entityType: 'ParkAsset' | 'Sensor' | 'Hub'): Promise<MaintenanceTask[]> {
    const whereClause: any = { taskStatus: MaintenanceTaskStatusEnum.COMPLETED };

    if (entityType === 'ParkAsset') {
      whereClause.parkAssetId = entityId;
    } else if (entityType === 'Sensor') {
      whereClause.sensorId = entityId;
    } else if (entityType === 'Hub') {
      whereClause.hubId = entityId;
    }

    return prisma.maintenanceTask.findMany({
      where: whereClause,
      orderBy: { completedDate: 'asc' },
    });
  }

  public async getOverdueRateByTaskTypeForPeriod(
    taskType: MaintenanceTaskTypeEnum,
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const overdueTasks = await prisma.maintenanceTask.count({
      where: {
        submittingStaff: { parkId: parkId },
        taskType: taskType,
        taskStatus: MaintenanceTaskStatusEnum.COMPLETED,
        completedDate: {
          gt: prisma.maintenanceTask.fields.dueDate, // Task was completed after the due date (overdue)
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalTasks = await prisma.maintenanceTask.count({
      where: {
        submittingStaff: { parkId: parkId },
        taskType: taskType,
        taskStatus: MaintenanceTaskStatusEnum.COMPLETED,
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return (overdueTasks / totalTasks) * 100;
  }

  public async getOverdueTaskCountByTaskTypeForPeriod(
    taskType: MaintenanceTaskTypeEnum,
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.maintenanceTask.count({
      where: {
        submittingStaff: { parkId: parkId },
        taskType: taskType,
        OR: [
          {
            // Completed tasks that were completed after their due date
            taskStatus: MaintenanceTaskStatusEnum.COMPLETED,
            completedDate: {
              gt: prisma.maintenanceTask.fields.dueDate,
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Open or in-progress tasks that are past their due date
            taskStatus: {
              in: [MaintenanceTaskStatusEnum.OPEN, MaintenanceTaskStatusEnum.IN_PROGRESS]
            },
            dueDate: {
              lt: new Date(), // Due date is in the past
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
    });
  }

  public async getCompletedTaskCountByTaskTypeForPeriod(
    taskType: MaintenanceTaskTypeEnum,
    parkId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.maintenanceTask.count({
      where: {
        submittingStaff: { parkId: parkId },
        taskType: taskType,
        taskStatus: MaintenanceTaskStatusEnum.COMPLETED,
        completedDate: { gte: startDate, lte: endDate },
      },
    });
  }
}

export default new MaintenanceTaskDao();
