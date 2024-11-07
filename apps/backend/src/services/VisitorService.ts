import { Prisma, Species, Visitor } from '@prisma/client';
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
  VisitorPasswordResetRequestSchema,
  VisitorPasswordResetRequestSchemaType,
  VisitorPasswordResetSchema,
  VisitorPasswordResetSchemaType,
  VerifyUserSchema,
  VerifyUserSchemaType,
} from '../schemas/visitorSchema';
import SpeciesDao from '../dao/SpeciesDao';
import { fromZodError } from 'zod-validation-error';

class VisitorService {
  public async register(data: VisitorSchemaType): Promise<{ visitor: Visitor; verificationToken: string }> {
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

      const token = jwt.sign({ email: data.email, action: 'verify_user' }, JWT_SECRET_KEY, { expiresIn: '15min' });

      // Send email with the reset link containing the token
      const verificationLink = `http://localhost:4201/verify-user?token=${token}`;
      EmailUtil.sendVerificationEmail(data.email, verificationLink);

      const visitor = await VisitorDao.createVisitor(visitorData);
      return { visitor, verificationToken: token };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
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
    data: Partial<Pick<VisitorSchemaType, 'firstName' | 'lastName' | 'email' | 'contactNumber'>>,
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

      // Convert the validated data to Prisma input type
      const prismaUpdateData: Prisma.VisitorUpdateInput = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      return VisitorDao.updateVisitorDetails(id, prismaUpdateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  public async login(data: LoginSchemaType): Promise<{ token: string; user: Omit<Visitor, 'password'> }> {
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

      const { password, ...userWithoutPassword } = visitor;

      return { token, user: userWithoutPassword };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      }
      throw error;
    }
  }

  private generateResetToken(visitorId: string): string {
    return jwt.sign(
      { id: visitorId, action: 'password_reset' },
      JWT_SECRET_KEY,
      { expiresIn: '15m' }, // Token expires in 15 minutes
    );
  }

  async requestPasswordReset(data: VisitorPasswordResetRequestSchemaType): Promise<{ message: string; resetToken?: string }> {
    try {
      VisitorPasswordResetRequestSchema.parse(data);

      const visitor = await VisitorDao.getVisitorByEmail(data.email);
      if (!visitor) {
        // Do not reveal if the email exists for security reasons
        throw new Error('If the email exists, a reset link has been sent.');
      }

      const resetToken = this.generateResetToken(visitor.id);
      await VisitorDao.updateVisitorDetails(visitor.id, {
        resetToken: resetToken,
        resetTokenUsed: false,
      });

      // Send email with the reset link containing the token
      const resetLink = `http://localhost:4201/visitor-reset-password?token=${resetToken}`;
      EmailUtil.sendPasswordResetEmail(data.email, resetLink);

      // Return the token only in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        return { message: 'Password reset email sent successfully', resetToken };
      }
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  async resetPassword(data: VisitorPasswordResetSchemaType): Promise<{ message: string }> {
    try {
      VisitorPasswordResetSchema.parse(data);

      const decodedToken = jwt.verify(data.token, JWT_SECRET_KEY) as {
        id: string;
        action: string;
      };

      if (decodedToken.action !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      const visitorId = decodedToken.id;
      if (!visitorId) {
        throw new Error('Invalid token: missing visitor ID');
      }

      const visitor = await VisitorDao.getVisitorById(visitorId);
      if (!visitor) {
        throw new Error(`Visitor not found`);
      }

      // Check if the reset token matches the one stored in the database
      if (visitor.resetToken !== data.token) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if the reset token has already been used
      if (visitor.resetTokenUsed) {
        throw new Error('This reset token has already been used. Please request a new password reset.');
      }

      // Check if new password is different from the old one
      if (await bcrypt.compare(data.newPassword, visitor.password)) {
        throw new Error('New password must be different from the old password');
      }

      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await VisitorDao.updateVisitorDetails(visitor.id, {
        password: hashedPassword,
        resetTokenUsed: true, // Mark the current token as used
        resetToken: null, // Clear the reset token
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async addFavoriteSpecies(visitorId: string, speciesId: string): Promise<Visitor> {
    const visitor = await VisitorDao.getVisitorById(visitorId);

    if (!visitor) {
      throw new Error('Visitor not found');
    }
    const favoriteSpecies = await VisitorDao.getFavoriteSpecies(visitorId);
    const isAlreadyFavorite = favoriteSpecies?.favoriteSpecies.some((species) => species.id === speciesId);

    if (isAlreadyFavorite) {
      throw new Error('Species is already in favorites');
    }
    return VisitorDao.addFavoriteSpecies(visitorId, speciesId);
  }

  public async getFavoriteSpecies(visitorId: string): Promise<Species[]> {
    const visitor = await VisitorDao.getVisitorById(visitorId);

    if (!visitor) {
      throw new Error('Visitor not found');
    }

    const favoriteSpecies = await VisitorDao.getFavoriteSpecies(visitorId);
    return favoriteSpecies?.favoriteSpecies || [];
  }

  public async deleteSpeciesFromFavorites(visitorId: string, speciesId: string): Promise<Visitor> {
    const visitor = await VisitorDao.getVisitorById(visitorId);

    if (!visitor) {
      throw new Error('Visitor not found');
    }

    return VisitorDao.deleteSpeciesFromFavorites(visitorId, speciesId);
  }

  public async isSpeciesInFavorites(visitorId: string, speciesId: string): Promise<boolean> {
    const visitor = await VisitorDao.getVisitorById(visitorId);

    if (!visitor) {
      throw new Error('Visitor not found');
    }

    const favoriteSpecies = await VisitorDao.getFavoriteSpecies(visitorId);
    return favoriteSpecies?.favoriteSpecies.some((species) => species.id === speciesId) || false;
  }

  public async verifyUser(data: VerifyUserSchemaType): Promise<{ message: string }> {
    try {
      VerifyUserSchema.parse(data);

      const decodedToken = jwt.verify(data.token, JWT_SECRET_KEY) as {
        email: string;
        action: string;
      };

      if (decodedToken.action !== 'verify_user') {
        throw new Error('Invalid verification token');
      }

      const visitor = await VisitorDao.getVisitorByEmail(decodedToken.email);

      if (!visitor) {
        throw new Error('Visitor not found');
      }

      if (visitor.isVerified) {
        throw new Error('Visitor already verified');
      }

      await VisitorDao.updateVisitorDetails(visitor.id, {
        isVerified: true,
      });

      return { message: 'Account verified successfully!' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => `${e.message}`);
        throw new Error(`Validation errors: ${errorMessages.join('; ')}`);
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Verification token has expired');
      } else {
        throw new Error(`Unable to verify user: ${error.message}`);
      }
    }
  }

  public async resendVerificationEmail(token: string): Promise<{ message: string }> {
    try {
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, JWT_SECRET_KEY) as {
          email: string;
          action: string;
        };
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          // Token is expired, but we still want to resend the email
          const decoded = jwt.decode(token) as { email: string; action: string };
          if (!decoded || decoded.action !== 'verify_user') {
            throw new Error('Invalid verification token');
          }
          const { email } = decoded;

          // console.log('Resend email to: ' + email);

          const visitor = await VisitorDao.getVisitorByEmail(email);
          if (!visitor) {
            throw new Error('Visitor not found');
          }

          const newToken = jwt.sign({ email, action: 'verify_user' }, JWT_SECRET_KEY, { expiresIn: '15min' });

          const verificationLink = `http://localhost:4201/verify-user?token=${newToken}`;

          EmailUtil.sendVerificationEmail(email, verificationLink);
          return { message: 'Verification email sent successfully' };
        } else {
          throw error;
        }
      }

      const { email, action } = decodedToken;

      if (action !== 'verify_user') {
        throw new Error('Invalid verification token');
      }

      const visitor = await VisitorDao.getVisitorByEmail(email);
      if (!visitor) {
        throw new Error('Visitor not found');
      }

      const newToken = jwt.sign({ email, action: 'verify_user' }, JWT_SECRET_KEY, { expiresIn: '15min' });

      const verificationLink = `http://localhost:4201/verify-user?token=${newToken}`;

      EmailUtil.sendVerificationEmail(email, verificationLink);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async sendVerificationEmailWithEmail(email: string, id: string): Promise<{ message: string }> {
    try {
      const visitor = await VisitorDao.getVisitorById(id);
      if (!visitor) {
        throw new Error('Visitor not found');
      }

      // set the user's isVerified to false, and update with new email
      await VisitorDao.updateVisitorDetails(visitor.id, {
        isVerified: false,
        email: email,
      });

      const token = jwt.sign({ email, action: 'verify_user' }, JWT_SECRET_KEY, { expiresIn: '2min' });

      const verificationLink = `http://localhost:4201/verify-user?token=${token}`;

      EmailUtil.sendVerificationEmail(email, verificationLink);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      throw new Error(`Unable to resend verification email: ${error.message}`);
    }
  }

  public async delete(data: { id: string; password: string }): Promise<{ message: string }> {
    const visitor = await VisitorDao.getVisitorById(data.id);

    if (!visitor) {
      // Use a generic error message to not reveal if the email exists
      throw new Error('Invalid credentials');
    }

    // Use bcrypt to compare the input password with the stored hash
    const isPasswordValid = await bcrypt.compare(data.password, visitor.password);

    if (!isPasswordValid) {
      throw new Error('Password is incorrect');
    }

    await VisitorDao.deleteVisitor(data.id);

    return { message: 'Visitor deleted successfully' };
  }
}

// Utility function to ensure all required fields are present
function ensureAllFieldsPresent(data: VisitorSchemaType & { password: string }): Prisma.VisitorCreateInput {
  if (!data.firstName || !data.lastName || !data.email || !data.contactNumber || !data.password) {
    throw new Error('Missing required fields for visitor creation');
  }
  return data as Prisma.VisitorCreateInput;
}

export default new VisitorService();
