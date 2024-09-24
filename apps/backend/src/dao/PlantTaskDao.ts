import { PrismaClient, Prisma, PlantTask } from '@prisma/client';
import ZoneDao from './ZoneDao';

const prisma = new PrismaClient();

class PlantTaskDao {
  async createPlantTask(data: Prisma.PlantTaskCreateInput): Promise<PlantTask> {
    return prisma.plantTask.create({ data });
  }

  async getAllPlantTasks(): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      include: {
        occurrence: {
          select: {
            id: true,
            title: true,
            zoneId: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getPlantTaskById(id: string): Promise<PlantTask | null> {
    return prisma.plantTask.findUnique({
      where: { id },
      include: {
        occurrence: true,
        assignedStaff: true,
      },
    });
  }

  async getPlantTasksByParkId(parkId: number): Promise<PlantTask[]> {
    const zones = await ZoneDao.getZonesByParkId(parkId);
    const zoneIds = zones.map(zone => zone.id);

    if (zoneIds.length === 0) {
      return []; // Return an empty array if no zones are found
    }

    const plantTasks = await prisma.plantTask.findMany({
      include: {
        occurrence: {
          select: {
            id: true,
            title: true,
            zoneId: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      where: {
        occurrence: {
          zoneId: {
            in: zoneIds, // Ensure zoneIds is an array
          },
        },
      },
    });

    return plantTasks.map(task => ({
      ...task,
      parkId,
      zoneName: zones.find(zone => zone.id === task.occurrence.zoneId)?.name,
    }));
  }

  async updatePlantTask(id: string, data: Prisma.PlantTaskUpdateInput): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data });
  }

  async deletePlantTask(id: string): Promise<void> {
    await prisma.plantTask.delete({ where: { id } });
  }
}

export default new PlantTaskDao();
