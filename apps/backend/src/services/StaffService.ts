import { Prisma, Staff, StaffRoleEnum } from '@prisma/client';
import StaffDao from '../dao/StaffDao';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';
import EmailUtil from '../utils/EmailUtil';

class StaffService {
  public async register(
    data: Prisma.StaffUncheckedCreateInput,
  ): Promise<Staff> {
    const checkForUser = await StaffDao.getStaffByEmail(data.email);

    if (checkForUser) {
      throw new Error('Email already exists.');
    }

    data.password = await bcrypt.hash(data.password, 10);

    return StaffDao.createStaff(data);
  }

  public async getAllStaffs(): Promise<Staff[]> {
    return StaffDao.getAllStaffs();
  }

  public async getStaffById(id: string): Promise<Staff> {
    try {
      const staff = await StaffDao.getStaffById(id);
      return staff;
    } catch (error) {
      throw new Error(`Unable to fetch staff details: ${error.message}`);
    }
  }

  public async updateStaffDetails(
    id: string,
    data: Prisma.StaffUpdateInput,
  ): Promise<Staff> {
    // Create an updateData object and only include fields that are provided
    const updateData: Prisma.StaffUpdateInput = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.contactNumber) updateData.contactNumber = data.contactNumber;

    return StaffDao.updateStaffDetails(id, updateData);
  }

  public async updateStaffRole(
    staffId: string,
    role: StaffRoleEnum,
    requesterId: string,
  ): Promise<Staff> {
    try {
      // Check if the requester is a manager
      const isRequesterManager = await StaffDao.isManager(requesterId);
      if (!isRequesterManager) {
        throw new Error('Only managers can update the role of other staff.');
      }

      const updateData: Prisma.StaffUpdateInput = { role };
      return await StaffDao.updateStaffDetails(staffId, updateData); // uses same update method since prisma knows which field to update
    } catch (error) {
      throw new Error(`Unable to update staff role: ${error.message}`);
    }
  }

  public async updateStaffIsActive(
    staffId: string,
    isActive: boolean,
    requesterId: string,
  ): Promise<Staff> {
    try {
      // Check if the requester is a manager
      const isRequesterManager = await StaffDao.isManager(requesterId);
      if (!isRequesterManager) {
        throw new Error(
          "Only managers can update another staff's active status.",
        );
      }

      const updateData: Prisma.StaffUpdateInput = { isActive };
      return await StaffDao.updateStaffDetails(staffId, updateData); // uses same update method since prisma knows which field to update
    } catch (error) {
      throw new Error(
        `Unable to update staff isActive status: ${error.message}`,
      );
    }
  }

  async login(data) {
    const staff = await StaffDao.getStaffByEmail(data.email);

    if (!staff || !(await bcrypt.compare(data.password, staff.password))) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign(
      {
        id: staff.id,
      },
      JWT_SECRET_KEY,
      { expiresIn: '4h' },
    );

    const { password, ...user } = staff;

    return { token, user };
  }

  async requestPasswordReset(email: string) {
    const staff = await StaffDao.getStaffByEmail(email);
    if (!staff) {
      throw new Error(`Staff not found for email: ${email}`);
    }

    // Create a short-lived JWT for password reset
    const resetToken = jwt.sign(
      { id: staff.id, action: 'password_reset' },
      JWT_SECRET_KEY,
      { expiresIn: '15m' }, // Token expires in 15 minutes
    );

    // Send email with the reset link containing the token
    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
    EmailUtil.sendPasswordResetEmail(email, resetLink); // Your email sending method
  }

  async resetPassword(token: string, newPassword: string) {
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }

    if (decodedToken.action !== 'password_reset') {
      throw new Error('Invalid reset token');
    }

    const staff = await StaffDao.getStaffById(decodedToken.id);

    if (!staff) {
      throw new Error(`Staff not found`);
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await StaffDao.updateStaff(staff.id, { password: hashedPassword });
  }

  // async updateAdmin(id: string, data: Prisma.AdminUpdateInput) {
  //   const admin = await AdminDao.getAdminById(id);
  //   if (!admin) {
  //     throw new Error(`Admin not found for id: ${id}`);
  //   }
  //   if (data.password) {
  //     data.password = await bcrypt.hash(data.password as string, 10);
  //   }

  //   return AdminDao.updateAdmin(id, data);
  // }

  // async deleteAdmin(id: string) {
  //   const admin = await AdminDao.getAdminById(id);
  //   if (!admin) {
  //     throw new Error(`Admin not found for id: ${id}`);
  //   }
  //   return AdminDao.deleteAdmin(id);
  // }

  // //getAdminById
  // async getAdminById(id: string) {
  //   return AdminDao.getAdminById(id);
  // }
}

export default new StaffService();