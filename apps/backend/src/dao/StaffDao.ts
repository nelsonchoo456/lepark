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

  //   async getAdminById(id: string): Promise<Admin> {
  //     return prisma.admin.findUnique({ where: { id } });
  //   }

  //   //updateAdminbyId
  //   async updateAdmin(id: string, updatedData: Prisma.AdminUpdateInput) {
  //     return prisma.admin.update({
  //       where: { id },
  //       data: updatedData,
  //     });
  //   }

  //   async deleteAdmin(id: string) {
  //     return prisma.admin.delete({ where: { id } });
  //   }
}

export default new StaffDao();
