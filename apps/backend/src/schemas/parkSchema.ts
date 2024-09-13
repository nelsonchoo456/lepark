import { z } from 'zod';
// import { PARK_STATUS_ENUM } from '@prisma/client';

// export const ParkSchema = z.object({
//   id: z.string().uuid().optional(), // ID is optional because it's usually auto-generated
//   name: z.string(),
//   description: z.string().optional(),
//   parkStatus: z.nativeEnum(PARK_STATUS_ENUM),
  
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
