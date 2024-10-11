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

  async updatePlantTask(id: string, data: Prisma.PlantTaskUpdateInput): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data });
  }

  async deletePlantTask(id: string): Promise<void> {
    await prisma.plantTask.delete({ where: { id } });
  }

  async deleteTaskskByStatus(taskStatus: PlantTaskStatusEnum): Promise<void> {
    await prisma.plantTask.deleteMany({ where: { taskStatus } });
  }

  async assignPlantTask(id: string, assignedStaff: Staff): Promise<PlantTask> {
    return prisma.plantTask.update({
      where: { id },
      data: { assignedStaffId: assignedStaff.id },
    });
  }

  async unassignPlantTask(id: string): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { assignedStaffId: null, taskStatus: PlantTaskStatusEnum.OPEN } });
  }

  async completePlantTask(id: string): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { completedDate: new Date() } });
  }

  async acceptPlantTask(staffId: string, id: string): Promise<PlantTask> {
    return prisma.plantTask.update({
      where: { id },
      data: { assignedStaffId: staffId },
    });
  }

  async unacceptPlantTask(id: string): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { assignedStaffId: null } });
  }

  async getMaxPositionForStatus(status: PlantTaskStatusEnum): Promise<number> {
    const result = await prisma.plantTask.aggregate({
      where: { taskStatus: status },
      _max: { position: true }
    });
    return result._max.position || 0;
  }

  async updatePositions(tasks: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      tasks.map(task => 
        prisma.plantTask.update({
          where: { id: task.id },
          data: { position: task.position }
        })
      )
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
}

export default new PlantTaskDao();
