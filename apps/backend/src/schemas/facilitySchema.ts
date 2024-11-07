import { z } from 'zod';
import { FacilityTypeEnum, FacilityStatusEnum } from '@prisma/client';

export const FacilitySchema = z.object({
  name: z.string().min(1, { message: 'Facility name is required' }),
  description: z.string().min(1, { message: 'Facility description is required' }),
  isBookable: z.boolean(),
  isPublic: z.boolean(),
  isSheltered: z.boolean(),
  facilityType: z.nativeEnum(FacilityTypeEnum),
  reservationPolicy: z.string().min(1, { message: 'Reservation policy is required' }),
  rulesAndRegulations: z.string().min(1, { message: 'Rules and regulations are required' }),
  images: z.array(z.string()).optional(),
  openingHours: z.array(z.date()),
  closingHours: z.array(z.date()),
  facilityStatus: z.nativeEnum(FacilityStatusEnum),
  lat: z.number().min(-90).max(90).optional(),
  long: z.number().min(-180).max(180).optional(),
  size: z.number().positive({ message: 'Size must be a positive number' }),
  capacity: z.number().int().nonnegative({ message: 'Capacity must be a non-negative number' }),
  fee: z.number().nonnegative({ message: 'Fee must be a non-negative number' }),
  parkId: z.number(),

  cameraSensorId: z.string().optional(),
});

export type FacilitySchemaType = z.infer<typeof FacilitySchema>;
