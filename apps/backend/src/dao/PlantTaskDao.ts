import { PrismaClient, Prisma, PlantTask } from '@prisma/client';

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

  async updatePlantTask(id: string, data: Prisma.PlantTaskUpdateInput): Promise<PlantTask> {
    return prisma.plantTask.update({ where: { id }, data });
  }

  async deletePlantTask(id: string): Promise<void> {
    await prisma.plantTask.delete({ where: { id } });
  }

  async getPlantTasksByParkId(parkId: number): Promise<PlantTask[]> {
    return prisma.plantTask.findMany({
      where: {
        occurrence: {
          zone: {
            parkId: parkId
          }
        }
      },
      include: {
        occurrence: {
          select: {
            id: true,
            title: true,
            zone: {
              select: {
                id: true,
                name: true,
                parkId: true
              }
            }
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
}

export default new PlantTaskDao();
