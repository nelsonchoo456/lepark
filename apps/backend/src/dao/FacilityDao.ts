import { PrismaClient, Facility, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class FacilityDao {
  async createFacility(data: Prisma.FacilityCreateInput): Promise<Facility> {
    return prisma.facility.create({
      data,
    });
  }

  async getAllFacilities(): Promise<Facility[]> {
    return prisma.facility.findMany();
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    return prisma.facility.findUnique({
      where: { id },
    });
  }

  async updateFacility(id: string, data: Prisma.FacilityUpdateInput): Promise<Facility> {
    return prisma.facility.update({
      where: { id },
      data,
    });
  }

  async deleteFacility(id: string): Promise<Facility> {
    return prisma.facility.delete({
      where: { id },
    });
  }

  async getFacilitiesByParkId(parkId: number): Promise<Facility[]> {
    return prisma.facility.findMany({
      where: { parkId },
    });
  }

  async getFacilityByNameAndParkId(name: string, parkId: number): Promise<Facility | null> {
    return prisma.facility.findFirst({ where: { name, parkId } });
  }
}

export default new FacilityDao();
