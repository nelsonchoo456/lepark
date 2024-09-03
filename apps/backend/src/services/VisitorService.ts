import { Prisma, Visitor } from '@prisma/client';
import { z } from 'zod';
import VisitorDao from '../dao/VisitorDao';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';
import EmailUtil from '../utils/EmailUtil';
import {
  VisitorSchema,
  VisitorSchemaType,
  LoginSchema,
  LoginSchemaType,
  PasswordResetRequestSchema,
  PasswordResetRequestSchemaType,
  PasswordResetSchema,
  PasswordResetSchemaType,
} from '../schemas/visitorSchema';

class VisitorService {
  public async register(data: VisitorSchemaType): Promise<Visitor> {
    try {
      // Validate input data using Zod
      VisitorSchema.parse(data);

      const checkForUser = await VisitorDao.getVisitorByEmail(data.email);

      if (checkForUser) {
        throw new Error('Email already exists.');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Convert validated data to Prisma input type
      const visitorData = ensureAllFieldsPresent({
        ...data,
        password: hashedPassword,
      });

      return VisitorDao.createVisitor(visitorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async getAllVisitors(): Promise<Visitor[]> {
    return VisitorDao.getAllVisitors();
  }

  public async getVisitorById(id: string): Promise<Visitor> {
    try {
      const visitor = await VisitorDao.getVisitorById(id);
      if (!visitor) {
        throw new Error('Visitor not found');
      }
      return visitor;
    } catch (error) {
      throw new Error(`Unable to fetch visitor details: ${error.message}`);
    }
  }

  public async updateVisitorDetails(
    id: string,
    data: Partial<
      Pick<
        VisitorSchemaType,
        'firstName' | 'lastName' | 'email' | 'contactNumber'
      >
    >,
  ): Promise<Visitor> {
    try {
      const existingVisitor = await VisitorDao.getVisitorById(id);
      if (!existingVisitor) {
        throw new Error('Visitor not found');
      }

      // Merge existing data with update data
      const mergedData = {
        ...existingVisitor,
        ...data,
      };

      // Validate merged data
      VisitorSchema.parse(mergedData);

      return VisitorDao.updateVisitorDetails(id, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async login(data: LoginSchemaType) {
    try {
      LoginSchema.parse(data);

      const visitor = await VisitorDao.getVisitorByEmail(data.email);

      if (!visitor) {
        // Use a generic error message to not reveal if the email exists
        throw new Error('Invalid credentials');
      }

      // Use bcrypt to compare the input password with the stored hash
      const isPasswordValid = await bcrypt.compare(data.password, visitor.password);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ id: visitor.id }, JWT_SECRET_KEY, {
        expiresIn: '4h',
      });

      const { password, ...user } = visitor;

      return { token, user };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async requestPasswordReset(data: PasswordResetRequestSchemaType) {
    try {
      PasswordResetRequestSchema.parse(data);

      const visitor = await VisitorDao.getVisitorByEmail(data.email);
      if (!visitor) {
        // Do not reveal if the email exists for security reasons
        throw new Error('If the email exists, a reset link has been sent.');
      }

      // Create a short-lived JWT for password reset
      const resetToken = jwt.sign(
        { id: visitor.id, action: 'password_reset' },
        JWT_SECRET_KEY,
        { expiresIn: '15m' }, // Token expires in 15 minutes
      );

      // Send email with the reset link containing the token
      const resetLink = `http://localhost:4201/reset-password?token=${resetToken}`;
      EmailUtil.sendPasswordResetEmail(data.email, resetLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async resetPassword(data: PasswordResetSchemaType) {
    try {
      PasswordResetSchema.parse(data);

      const decodedToken = jwt.verify(data.token, JWT_SECRET_KEY) as {
        id: string;
        action: string;
      };

      if (decodedToken.action !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      const visitor = await VisitorDao.getVisitorById(decodedToken.id);

      if (!visitor) {
        throw new Error('Visitor not found');
      }

      // Check if new password is different from the old one
      if (await bcrypt.compare(data.newPassword, visitor.password)) {
        throw new Error('New password must be different from the old password');
      }

      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await VisitorDao.updateVisitorDetails(visitor.id, {
        password: hashedPassword,
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
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
function ensureAllFieldsPresent(
  data: VisitorSchemaType & { password: string },
): Prisma.VisitorCreateInput {
  if (
    !data.firstName ||
    !data.lastName ||
    !data.email ||
    !data.contactNumber ||
    !data.password
  ) {
    throw new Error('Missing required fields for visitor creation');
  }
  return data as Prisma.VisitorCreateInput;
}

export default new VisitorService();
