import { Prisma, StaffRoleEnum, Visitor } from '@prisma/client';
import VisitorDao from '../dao/VisitorDao';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';
import EmailUtil from '../utils/EmailUtil';

class VisitorService {
  public async register(
    data: Prisma.VisitorUncheckedCreateInput,
  ): Promise<Visitor> {
    const checkForUser = await VisitorDao.getVisitorByEmail(data.email);

    if (checkForUser) {
      throw new Error('Email already exists.');
    }

    data.password = await bcrypt.hash(data.password, 10);

    return VisitorDao.createVisitor(data);
  }

  public async getAllVisitors(): Promise<Visitor[]> {
    return VisitorDao.getAllVisitors();
  }

  public async getVisitorById(id: string): Promise<Visitor> {
    try {
      const staff = await VisitorDao.getVisitorById(id);
      return staff;
    } catch (error) {
      throw new Error(`Unable to fetch visitor details: ${error.message}`);
    }
  }

  public async updateVisitorDetails(
    id: string,
    data: Prisma.VisitorUpdateInput,
  ): Promise<Visitor> {
    // Create an updateData object and only include fields that are provided
    const updateData: Prisma.VisitorUpdateInput = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.contactNumber) updateData.contactNumber = data.contactNumber;

    return VisitorDao.updateVisitorDetails(id, updateData);
  }

  async login(data) {
    const visitor = await VisitorDao.getVisitorByEmail(data.email);

    if (!visitor || !(await bcrypt.compare(data.password, visitor.password))) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign(
      {
        id: visitor.id,
      },
      JWT_SECRET_KEY,
      { expiresIn: '4h' },
    );

    const { password, ...user } = visitor;

    return { token, user };
  }

  async requestPasswordReset(email: string) {
    const visitor = await VisitorDao.getVisitorByEmail(email);
    if (!visitor) {
      throw new Error(`Visitor not found for email: ${email}`);
    }

    // Create a short-lived JWT for password reset
    const resetToken = jwt.sign(
      { id: visitor.id, action: 'password_reset' },
      JWT_SECRET_KEY,
      { expiresIn: '15m' }, // Token expires in 15 minutes
    );

    // Send email with the reset link containing the token
    const resetLink = `http://localhost:4201/reset-password?token=${resetToken}`;
    EmailUtil.sendPasswordResetEmail(email, resetLink);
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

    const visitor = await VisitorDao.getVisitorById(decodedToken.id);

    if (!visitor) {
      throw new Error(`Visitor not found`);
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await VisitorDao.updateVisitor(visitor.id, { password: hashedPassword });
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

export default new VisitorService();
