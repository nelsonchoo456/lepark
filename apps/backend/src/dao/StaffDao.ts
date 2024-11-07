import { PrismaClient, Prisma, Staff } from '@prisma/client';

const prisma = new PrismaClient();

class StaffDao {
  public async createStaff(data: Prisma.StaffCreateInput): Promise<Staff> {
    return prisma.staff.create({ data });
  }

  public async getStaffByEmail(email: string): Promise<Staff | null> {
    return prisma.staff.findUnique({ where: { email } });
  }

  public async getAllStaffs(): Promise<Staff[]> {
    return prisma.staff.findMany();
  }

  public async getAllStaffsByParkId(parkId: number): Promise<Staff[]> {
    return prisma.staff.findMany({ where: { parkId } });
  }

  public async getStaffById(id: string): Promise<Staff | null> {
    return prisma.staff.findUnique({ where: { id } });
  }

  public async updateStaffDetails(
    id: string,
    data: Prisma.StaffUpdateInput,
  ): Promise<Staff> {
    return prisma.staff.update({ where: { id }, data });
  }

  public async isManagerOrSuperadmin(id: string): Promise<boolean> {
    const staff = await prisma.staff.findUnique({ where: { id } });
    return staff.role === 'MANAGER' || staff.role === 'SUPERADMIN';
  }

  public async updateResetTokenUsed(id: string, used: boolean): Promise<Staff> {
    return prisma.staff.update({
      where: { id },
      data: { resetTokenUsed: used },
    });
  }

  //   async deleteAdmin(id: string) {
  //     return prisma.admin.delete({ where: { id } });
  //   }
}

export default new StaffDao();
