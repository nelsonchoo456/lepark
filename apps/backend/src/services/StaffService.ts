import { Prisma, Staff, StaffRoleEnum } from '@prisma/client';
import { z } from 'zod';
import StaffDao from '../dao/StaffDao';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';
import EmailUtil from '../utils/EmailUtil';
import {
  StaffSchema,
  StaffSchemaType,
  LoginSchema,
  LoginSchemaType,
  PasswordResetRequestSchema,
  PasswordResetRequestSchemaType,
  PasswordResetSchema,
  PasswordResetSchemaType,
} from '../schemas/staffSchema';

class StaffService {
  public async register(data: StaffSchemaType): Promise<Staff> {
    try {
      // Validate input data using Zod
      StaffSchema.parse(data);

      const checkForUser = await StaffDao.getStaffByEmail(data.email);

      if (checkForUser) {
        throw new Error('Email already exists.');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Convert validated data to Prisma input type
      const staffData = ensureAllFieldsPresent({
        ...data,
        password: hashedPassword,
      });

      const updatedData = {
        ...staffData,
        isActive: true,
      };

      return StaffDao.createStaff(updatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async getAllStaffs(): Promise<Staff[]> {
    return StaffDao.getAllStaffs();
  }

  public async getStaffById(id: string): Promise<Staff> {
    try {
      const staff = await StaffDao.getStaffById(id);
      if (!staff) {
        throw new Error('Staff not found');
      }
      return staff;
    } catch (error) {
      throw new Error(`Unable to fetch staff details: ${error.message}`);
    }
  }

  public async updateStaffDetails(
    id: string,
    data: Partial<Pick<StaffSchemaType, 'firstName' | 'lastName' | 'contactNumber'>>,
  ): Promise<Staff> {
    try {
      const existingStaff = await StaffDao.getStaffById(id);
      if (!existingStaff) {
        throw new Error('Staff not found');
      }

      // Merge existing data with update data, keeping existing values if not provided
      const mergedData = {
        ...existingStaff,
        ...data,
      };

      // Validate merged data using Zod
      StaffSchema.parse(mergedData);

      // Convert the validated data to Prisma input type
      const prismaUpdateData: Prisma.StaffUpdateInput = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return StaffDao.updateStaffDetails(id, prismaUpdateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async updateStaffRole(staffId: string, role: StaffRoleEnum, requesterId: string): Promise<Staff> {
    try {
      const staffToUpdate = await StaffDao.getStaffById(staffId);
      if (!staffToUpdate) {
        throw new Error('Staff not found');
      }
      // Check if the requester is a manager
      const isRequesterManager = await StaffDao.isManager(requesterId);
      if (!isRequesterManager) {
        throw new Error('Only managers can update the role of other staff.');
      }

      const updateData: Prisma.StaffUpdateInput = { role };
      return await StaffDao.updateStaffDetails(staffId, updateData);
    } catch (error) {
      throw new Error(`Unable to update staff role: ${error.message}`);
    }
  }

  public async updateStaffIsActive(staffId: string, isActive: boolean, requesterId: string): Promise<Staff> {
    try {
      const staffToUpdate = await StaffDao.getStaffById(staffId);
      if (!staffToUpdate) {
        throw new Error('Staff not found');
      }
      // Check if the requester is a manager
      const isRequesterManager = await StaffDao.isManager(requesterId);
      if (!isRequesterManager) {
        throw new Error("Only managers can update another staff's active status.");
      }

      const updateData: Prisma.StaffUpdateInput = { isActive };
      return await StaffDao.updateStaffDetails(staffId, updateData);
    } catch (error) {
      throw new Error(`Unable to update staff isActive status: ${error.message}`);
    }
  }

  async login(data: LoginSchemaType) {
    try {
      LoginSchema.parse(data);

      const staff = await StaffDao.getStaffByEmail(data.email);
      if (!staff) {
        // Use a generic error message to not reveal if the email exists
        throw new Error('Invalid credentials');
      }

      // Use bcrypt to compare the input password with the stored hash
      const isPasswordValid = await bcrypt.compare(data.password, staff.password);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ id: staff.id }, JWT_SECRET_KEY, {
        expiresIn: '4h',
      });

      const { password, ...user } = staff;

      return { token, user };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  async requestPasswordReset(data: PasswordResetRequestSchemaType) {
    try {
      PasswordResetRequestSchema.parse(data);

      const staff = await StaffDao.getStaffByEmail(data.email);
      if (!staff) {
        // Do not reveal if the email exists for security reasons
        throw new Error('If the email exists, a reset link has been sent.');
      }

      // Create a short-lived JWT for password reset
      const resetToken = jwt.sign(
        { id: staff.id, action: 'password_reset' },
        JWT_SECRET_KEY,
        { expiresIn: '15m' }, // Token expires in 15 minutes
      );

      // Send email with the reset link containing the token
      const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
      EmailUtil.sendPasswordResetEmail(data.email, resetLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  async resetPassword(data: PasswordResetSchemaType) {
    try {
      PasswordResetSchema.parse(data);

      const decodedToken = jwt.verify(data.token, JWT_SECRET_KEY) as {
        id: string;
        action: string;
      };

      if (decodedToken.action !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      const staff = await StaffDao.getStaffById(decodedToken.id);

      if (!staff) {
        throw new Error(`Staff not found`);
      }

      // Check if new password is different from the old one
      if (await bcrypt.compare(data.newPassword, staff.password)) {
        throw new Error('New password must be different from the old password');
      }

      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await StaffDao.updateStaffDetails(staff.id, { password: hashedPassword });

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
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

// Utility function to ensure all required fields are present
function ensureAllFieldsPresent(data: StaffSchemaType & { password: string }): Prisma.StaffCreateInput {
  if (!data.firstName || !data.lastName || !data.email || !data.role || !data.contactNumber || !data.password) {
    throw new Error('Missing required fields for staff creation');
  }
  return data as Prisma.StaffCreateInput;
}

export default new StaffService();
