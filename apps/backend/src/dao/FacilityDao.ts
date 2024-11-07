import { PrismaClient, Facility, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class FacilityDao {
  public async createFacility(
    data: Prisma.FacilityCreateInput
  ): Promise<Facility> {
    return prisma.facility.create({
      data,
    });
  }

  public async getAllFacilities(): Promise<Facility[]> {
    return prisma.facility.findMany();
  }

  public async getFacilityById(
    id: string
  ): Promise<Facility | null> {
    return prisma.facility.findUnique({
      where: { id },
    });
  }

  public async updateFacility(
    id: string, 
    data: Prisma.FacilityUpdateInput
  ): Promise<Facility> {
    return prisma.facility.update({
      where: { id },
      data,
    });
  }

  public async deleteFacility(
    id: string
  ): Promise<Facility> {
    return prisma.facility.delete({
      where: { id },
    });
  }

  public async getFacilitiesByParkId(
    parkId: number
  ): Promise<Facility[]> {
    return prisma.facility.findMany({
      where: { parkId },
    });
  }

  public async getFacilityByNameAndParkId(
    name: string, 
    parkId: number
  ): Promise<Facility | null> {
    return prisma.facility.findFirst({ where: { name, parkId } });
  }
}

export default new FacilityDao();
