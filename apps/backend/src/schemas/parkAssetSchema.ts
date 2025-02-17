import { z } from 'zod';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from '@prisma/client';

export const ParkAssetSchema = z.object({
  id: z.string().uuid().optional(),
  identifierNumber: z.string().optional(), // Make it optional as it will be auto-generated
  serialNumber: z.string().optional(),
  name: z.string().min(1, { message: 'Asset name is required' }),
  parkAssetType: z.nativeEnum(ParkAssetTypeEnum),
  description: z.string().optional(),
  parkAssetStatus: z.nativeEnum(ParkAssetStatusEnum),
  acquisitionDate: z.date(),
  nextMaintenanceDate: z.date().optional(),
  nextMaintenanceDates: z.array(z.date()).optional(),
  supplier: z.string().min(1, { message: 'Supplier is required' }),
  supplierContactNumber: z.string().min(1, { message: 'Supplier contact number is required' }),
  parkAssetCondition: z.nativeEnum(ParkAssetConditionEnum),
  images: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  facilityId: z.string().uuid().optional(),
});

export type ParkAssetSchemaType = z.infer<typeof ParkAssetSchema>;