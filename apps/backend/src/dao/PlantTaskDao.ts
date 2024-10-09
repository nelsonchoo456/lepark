import { PrismaClient, Prisma, PlantTask, Staff } from '@prisma/client';
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
    });
  }

  async updatePlantTask(id: string, data: Prisma.PlantTaskUpdateInput): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data });
  }

  async deletePlantTask(id: string): Promise<void> {
    await prisma.plantTask.delete({ where: { id } });
  }

  async assignPlantTask(id: string, assignedStaff: Staff): Promise<PlantTask> {
    return prisma.plantTask.update({
      where: { id },
      data: { assignedStaffId: assignedStaff.id },
    });
  }

  async unassignPlantTask(id: string): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data: { assignedStaffId: null } });
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
}

export default new PlantTaskDao();
