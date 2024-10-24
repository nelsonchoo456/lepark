import { PrismaClient, Prisma, MaintenanceTask, Staff, MaintenanceTaskStatusEnum, MaintenanceTaskTypeEnum } from '@prisma/client';

const prisma = new PrismaClient();

class MaintenanceTaskDao {
  async createMaintenanceTask(data: Prisma.MaintenanceTaskCreateInput): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.create({ data });
  }

  async getAllMaintenanceTasks(): Promise<MaintenanceTask[]> {
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

  async getMaintenanceTaskById(id: string): Promise<MaintenanceTask | null> {
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

  async getAllMaintenanceTasksByStaffId(staffId: string): Promise<MaintenanceTask[]> {
    return prisma.maintenanceTask.findMany({
      where: { assignedStaffId: staffId },
    });
  }

  async updateMaintenanceTask(id: string, data: Prisma.MaintenanceTaskUpdateInput): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({ where: { id }, data });
  }

  async deleteMaintenanceTask(id: string): Promise<void> {
    await prisma.maintenanceTask.delete({ where: { id } });
  }

  async deleteMaintenanceTasksByStatus(taskStatus: MaintenanceTaskStatusEnum): Promise<void> {
    await prisma.maintenanceTask.deleteMany({ where: { taskStatus } });
  }

  async assignMaintenanceTask(id: string, assignedStaff: Staff, updatedAt: Date): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({
      where: { id },
      data: { taskStatus: MaintenanceTaskStatusEnum.IN_PROGRESS, assignedStaffId: assignedStaff.id, updatedAt: updatedAt },
    });
  }

  async unassignMaintenanceTask(id: string, updatedAt: Date): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({
      where: { id },
      data: { taskStatus: MaintenanceTaskStatusEnum.OPEN, assignedStaffId: null, updatedAt: updatedAt },
    });
  }

  async acceptMaintenanceTask(id: string, staffId: string, updatedAt: Date): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({
      where: { id },
      data: { taskStatus: MaintenanceTaskStatusEnum.IN_PROGRESS, assignedStaffId: staffId, updatedAt: updatedAt },
    });
  }

  async unacceptMaintenanceTask(id: string, updatedAt: Date): Promise<MaintenanceTask> {
    return prisma.maintenanceTask.update({
      where: { id },
      data: { taskStatus: MaintenanceTaskStatusEnum.OPEN, assignedStaffId: null, updatedAt: updatedAt },
    });
  }

  async getMaintenanceTasksByStatus(status: MaintenanceTaskStatusEnum): Promise<MaintenanceTask[]> {
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

  async getMaintenanceTasksBySubmittingStaff(staffId: string): Promise<MaintenanceTask[]> {
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

  async getMaxPositionForStatus(status: MaintenanceTaskStatusEnum): Promise<number> {
    const result = await prisma.maintenanceTask.aggregate({
      where: { taskStatus: status },
      _max: { position: true },
    });
    return result._max.position || 0;
  }

  async updatePositions(tasks: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      tasks.map((task) =>
        prisma.maintenanceTask.update({
          where: { id: task.id },
          data: { position: task.position },
        }),
      ),
    );
  }

  async getMaintenanceTasksByParkId(parkId: number): Promise<MaintenanceTask[]> {
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

  async getAverageTaskTypeCompletionTime(taskType: MaintenanceTaskTypeEnum, parkId: number, startDate: Date, endDate: Date): Promise<number> {
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

  async getCompletedMaintenanceTasksByEntityId(entityId: string, entityType: 'ParkAsset' | 'Sensor' | 'Hub'): Promise<MaintenanceTask[]> {
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
  async getOverdueRateByTaskTypeForPeriod(taskType: MaintenanceTaskTypeEnum, parkId: number, startDate: Date, endDate: Date): Promise<number> {
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

    return overdueTasks / totalTasks;
  }
}

export default new MaintenanceTaskDao();
