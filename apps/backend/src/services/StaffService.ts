import { Prisma, Staff } from '@prisma/client';
import StaffDao from '../dao/StaffDao';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const SALT_ROUNDS = 10;

class StaffService {
  public async register(data): Promise<Staff> {
    console.log(data);
    const checkForUser = await StaffDao.getStaffByEmail(data.email);

    if (checkForUser) {
      throw new Error('Email already exists.');
    }

    const { password, ...rest } = data;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(data.password, salt);

    return StaffDao.createStaff({
      ...rest,
      passwordHash: passwordHash,
      salt: salt,
    });
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

  // async login(data: AdminGetData) {
  //   const admin = await AdminDao.getAdminByEmail(data.email);

  //   if (!admin || !(await bcrypt.compare(data.password, admin.password))) {
  //     throw new Error('Invalid credentials.');
  //   }

  //   // Generate a JWT token with necessary admin details
  //   const token = jwt.sign(
  //     {
  //       id: admin.id,
  //       // firstName: admin.firstName,
  //       // lastName: admin.lastName,
  //       // email: admin.email,
  //       // type: admin.type,
  //     },
  //     JWT_SECRET_KEY,
  //     { expiresIn: '4h' },
  //   );

  //   // Destructure admin object to omit password and possibly other sensitive fields
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { password, ...user } = admin;

  //   return { token, user };
  // }

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

  // async requestPasswordReset(email: string) {
  //   const admin = await AdminDao.getAdminByEmail(email);
  //   if (!admin) {
  //     throw new Error(`Admin not found for email: ${email}`);
  //   }

  //   // Create a short-lived JWT for password reset
  //   const resetToken = jwt.sign(
  //     { id: admin.id, action: 'password_reset' },
  //     JWT_SECRET_KEY,
  //     { expiresIn: '15m' }, // Token expires in 15 minutes
  //   );

  //   // Send email with the reset link containing the token
  //   const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
  //   EmailUtility.sendPasswordResetEmail(email, resetLink); // Your email sending method
  // }

  // async resetPassword(token: string, newPassword: string) {
  //   let decodedToken;

  //   try {
  //     decodedToken = jwt.verify(token, JWT_SECRET_KEY);
  //   } catch (error) {
  //     throw new Error('Invalid or expired reset token');
  //   }

  //   if (decodedToken.action !== 'password_reset') {
  //     throw new Error('Invalid reset token');
  //   }

  //   const admin = await AdminDao.getAdminById(decodedToken.id);

  //   if (!admin) {
  //     throw new Error(`Admin not found`);
  //   }

  //   // Hash and update the new password
  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   await AdminDao.updateAdmin(admin.id, { password: hashedPassword });
  // }

  // //getAdminById
  // async getAdminById(id: string) {
  //   return AdminDao.getAdminById(id);
  // }
}

export default new StaffService();
