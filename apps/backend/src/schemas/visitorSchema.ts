import { z } from 'zod';

export const VisitorSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  contactNumber: z.string().min(1, { message: "Contact number is required" }),
  favoriteSpecies: z.array(z.string()).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password is required or must be at least 8 characters long" }),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const PasswordResetSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type VisitorSchemaType = z.infer<typeof VisitorSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type PasswordResetRequestSchemaType = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetSchemaType = z.infer<typeof PasswordResetSchema>;
