import { z } from 'zod';
import { SensorTypeEnum, SensorStatusEnum, SensorUnitEnum } from '@prisma/client';

export const SensorSchema = z.object({
  id: z.string().uuid().optional(),
  sensorName: z.string().min(1, { message: 'Sensor name is required' }),
  sensorType: z.nativeEnum(SensorTypeEnum),
  sensorDescription: z.string().optional(),
  sensorStatus: z.nativeEnum(SensorStatusEnum),
  acquisitionDate: z.date(),
  lastCalibratedDate: z.date().optional(),
  calibrationFrequencyDays: z.number().int().positive(),
  recurringMaintenanceDuration: z.number().int().positive(),
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  dataFrequencyMinutes: z.number().int().positive(),
  sensorUnit: z.nativeEnum(SensorUnitEnum),
  supplier: z.string().min(1, { message: 'Supplier is required' }),
  supplierContactNumber: z.string().min(1, { message: 'Supplier contact number is required' }),
  image: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  remarks: z.string().optional(),
  hubId: z.string().uuid().optional(),
  facilityId: z.string().uuid().optional(),
});

export type SensorSchemaType = z.infer<typeof SensorSchema>;
