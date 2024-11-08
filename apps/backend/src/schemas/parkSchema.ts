import { z } from 'zod';
// import { ParkStatusEnum } from '@prisma/client';

// export const ParkSchema = z.object({
//   id: z.string().uuid().optional(), // ID is optional because it's usually auto-generated
//   name: z.string(),
//   description: z.string().optional(),
//   parkStatus: z.nativeEnum(ParkStatusEnum),

// });

// export type ParkSchemaType = z.infer<typeof ParkSchema>;

export interface ParkCreateData {
  name: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours: Date[];
  closingHours: Date[];
  images?: string[];
  geom: string;
  paths: string;
  parkStatus: string;
}

export interface ParkUpdateData {
  name?: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours?: Date[];
  closingHours?: Date[];
  images?: string[];
  geom?: string;
  paths?: string;
  parkStatus?: string;
}

export interface ParkResponseData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  openingHours: Date[];
  closingHours: Date[];
  images?: string[];
  geom: any;
  paths: any;
  parkStatus: string;
}
