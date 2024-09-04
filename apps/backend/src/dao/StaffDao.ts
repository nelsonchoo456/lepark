import { PrismaClient, Prisma, Staff } from '@prisma/client';

const prisma = new PrismaClient();

class StaffDao {
  async createStaff(data: Prisma.StaffUncheckedCreateInput): Promise<Staff> {
    return prisma.staff.create({ data });
  }

  async getStaffByEmail(email: string): Promise<Staff> {
    return prisma.staff.findUnique({ where: { email } });
  }

  async getAllStaffs(): Promise<Staff[]> {
    return prisma.staff.findMany();
  }

  async getStaffById(id: string): Promise<Staff> {
    return prisma.staff.findUnique({ where: { id } });
  }

  async updateStaffDetails(
    id: string,
    data: Prisma.StaffUpdateInput,
  ): Promise<Staff> {
    return prisma.staff.update({ where: { id }, data });
  }

  async isManager(id: string): Promise<boolean> {
    const staff = await prisma.staff.findUnique({ where: { id } });
    return staff.role === 'MANAGER';
  }

  async updateStaff(id: string, updatedData: Prisma.StaffUpdateInput) {
    return prisma.staff.update({
      where: { id },
      data: updatedData,
    });
  }

  //   async deleteAdmin(id: string) {
  //     return prisma.admin.delete({ where: { id } });
  //   }
}

export default new StaffDao();