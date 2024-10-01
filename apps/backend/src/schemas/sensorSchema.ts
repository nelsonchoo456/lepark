import { z } from 'zod';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';

export const SensorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: 'Sensor name is required' }),
  identifierNumber: z.string().optional(), // Make it optional as it will be auto-generated
  serialNumber: z.string().min(1, { message: 'Serial number is required' }),
  sensorType: z.nativeEnum(SensorTypeEnum),
  description: z.string().optional(),
  sensorStatus: z.nativeEnum(SensorStatusEnum),
  acquisitionDate: z.date(),
  lastCalibratedDate: z.date().optional(),
  calibrationFrequencyDays: z.number().int().positive().optional(),
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  dataFrequencyMinutes: z.number().int().positive().optional(),
  sensorUnit: z.nativeEnum(SensorUnitEnum).optional(),
  supplier: z.string().min(1, { message: 'Supplier is required' }),
  supplierContactNumber: z.string().min(1, { message: 'Supplier contact number is required' }),
  images: z.array(z.string()).optional(),
  lat: z.number().min(-90).max(90).optional(),
  long: z.number().min(-180).max(180).optional(),
  remarks: z.string().optional(),
  hubId: z.string().uuid().optional(),
  facilityId: z.string().uuid().optional(),
});

export type SensorSchemaType = z.infer<typeof SensorSchema>;
