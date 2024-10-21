import { PrismaClient, Prisma, PlantTask, Staff, PlantTaskStatusEnum } from '@prisma/client';
import ZoneDao from './ZoneDao';

const prisma = new PrismaClient();

class PlantTaskDao {
  async createPlantTask(data: Prisma.PlantTaskCreateInput): Promise<PlantTask> {
    return prisma.plantTask.create({ data });
  }

  async getAllPlantTasks(): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async getAllPlantTasksByParkId(parkId: number): Promise<PlantTask[]> {
    const zones = await ZoneDao.getZonesByParkId(parkId);
    const zoneIds = zones.map((zone) => zone.id);

    if (zoneIds.length === 0) {
      return []; // Return an empty array if no zones are found
    }

    return prisma.plantTask.findMany({
      where: {
        occurrence: {
          zoneId: {
            in: zoneIds,
          },
        },
      },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async getPlantTaskById(id: string): Promise<PlantTask | null> {
    return prisma.plantTask.findUnique({
      where: { id },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async getAllAssignedPlantTasks(staffId: string): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      where: {
        assignedStaffId: staffId,
      },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async getPlantTasksBySubmittingStaff(staffId: string): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      where: { submittingStaffId: staffId },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async getAllAssignedPlantTasksThatAreOpenOrInProgressByStaffId(staffId: string): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      where: {
        assignedStaffId: staffId,
        taskStatus: {
          in: [PlantTaskStatusEnum.OPEN, PlantTaskStatusEnum.IN_PROGRESS],
        },
      },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async getAllAssignedPlantTasksThatAreOpenOrInProgressByParkId(parkId: number): Promise<PlantTask[]> {
    const zones = await ZoneDao.getZonesByParkId(parkId);
    const zoneIds = zones.map((zone) => zone.id);

    if (zoneIds.length === 0) {
      return []; // Return an empty array if no zones are found
    }

    return prisma.plantTask.findMany({
      where: {
        occurrence: {
          zoneId: {
            in: zoneIds,
          },
        },
        assignedStaffId: {
          not: null,
        },
        taskStatus: {
          in: [PlantTaskStatusEnum.OPEN, PlantTaskStatusEnum.IN_PROGRESS],
        },
      },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async updatePlantTask(id: string, data: Prisma.PlantTaskUpdateInput): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data });
  }

  async deletePlantTask(id: string): Promise<void> {
    await prisma.plantTask.delete({ where: { id } });
  }

  async deleteTasksByStatus(taskStatus: PlantTaskStatusEnum): Promise<void> {
    await prisma.plantTask.deleteMany({ where: { taskStatus } });
  }

  async assignPlantTask(id: string, assignedStaff: Staff, updatedAt: Date): Promise<PlantTask> {
    return prisma.plantTask.update({
      where: { id },
      data: { assignedStaffId: assignedStaff.id, updatedAt: updatedAt },
    });
  }

  async unassignPlantTask(id: string, updatedAt: Date): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { assignedStaffId: null, taskStatus: PlantTaskStatusEnum.OPEN } });
  }

  async completePlantTask(id: string, updatedAt: Date): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { completedDate: new Date(), updatedAt: updatedAt } });
  }

  async acceptPlantTask(staffId: string, id: string, updatedAt: Date): Promise<PlantTask> {
    return prisma.plantTask.update({
      where: { id },
      data: { assignedStaffId: staffId, updatedAt: updatedAt },
    });
  }

  async unacceptPlantTask(id: string, updatedAt: Date): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { assignedStaffId: null, updatedAt: updatedAt } });
  }

  async getMaxPositionForStatus(status: PlantTaskStatusEnum): Promise<number> {
    const result = await prisma.plantTask.aggregate({
      where: { taskStatus: status },
      _max: { position: true },
    });
    return result._max.position || 0;
  }

  async updatePositions(tasks: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      tasks.map((task) =>
        prisma.plantTask.update({
          where: { id: task.id },
          data: { position: task.position },
        }),
      ),
    );
  }

  async getPlantTasksByStatus(status: PlantTaskStatusEnum): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      where: { taskStatus: status },
      orderBy: { position: 'asc' },
      include: {
        assignedStaff: true,
        submittingStaff: true,
      },
    });
  }

  async rebalancePositions(status: PlantTaskStatusEnum): Promise<void> {
    const tasks = await this.getPlantTasksByStatus(status);
    const updatedTasks = tasks.map((task, index) => ({
      id: task.id,
      position: (index + 1) * 1000, // Multiply by 1000 to leave room between tasks
    }));

    await this.updatePositions(updatedTasks);
  }

  async getStaffCompletedTasksForPeriod(staffId: string, startDate: Date, endDate: Date): Promise<number> {
    return prisma.plantTask.count({
      where: {
        assignedStaffId: staffId,
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
        taskStatus: PlantTaskStatusEnum.COMPLETED,
      },
    });
  }

  async getStaffTotalTasksForPeriod(staffId: string, startDate: Date, endDate: Date): Promise<number> {
    return prisma.plantTask.count({
      where: {
        assignedStaffId: staffId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async getStaffOverdueTasksForPeriod(staffId: string, startDate: Date, endDate: Date): Promise<number> {
    return prisma.plantTask.count({
      where: {
        assignedStaffId: staffId,
        dueDate: {
          gte: startDate, // Due date is on or after startDate
          lte: endDate, // Due date is on or before endDate
        },
        OR: [
          {
            completedDate: {
              gt: prisma.plantTask.fields.dueDate, // Task was completed after the due date (overdue)
            },
          },
          {
            completedDate: null, // Task is not completed but past its due date
            dueDate: {
              lt: new Date(), // The due date is in the past
            },
          },
        ],
      },
    });
  }

  async getStaffTotalTasksDueForPeriod(staffId: string, startDate: Date, endDate: Date): Promise<number> {
    return prisma.plantTask.count({
      where: {
        assignedStaffId: staffId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async getStaffAverageTaskCompletionTime(staffId: string, startDate: Date, endDate: Date): Promise<number> {
    const tasks = await prisma.plantTask.findMany({
      where: {
        assignedStaffId: staffId,
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
}

export default new PlantTaskDao();
