import { z } from 'zod';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from '@prisma/client';

export const ParkAssetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  parkAssetType: z.nativeEnum(ParkAssetTypeEnum),
  description: z.string().optional(),
  parkAssetStatus: z.nativeEnum(ParkAssetStatusEnum),
  acquisitionDate: z.date(),
  recurringMaintenanceDuration: z.number().int().positive().optional(),
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  supplier: z.string(),
  supplierContactNumber: z.string(),
  parkAssetCondition: z.nativeEnum(ParkAssetConditionEnum),
  images: z.array(z.string()).optional(), // Array of image URLs
  remarks: z.string().optional(),
  facilityId: z.string().uuid(),
});

export type ParkAssetSchemaType = z.infer<typeof ParkAssetSchema>;
