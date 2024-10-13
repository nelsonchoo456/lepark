import { z } from 'zod';
import { HubStatusEnum } from '@prisma/client';

export const HubSchema = z.object({
  id: z.string().uuid().optional(),
  identifierNumber: z.string().optional(), // Make it optional as it will be auto-generated
  serialNumber: z.string().min(1, { message: 'Serial number is required' }),
  name: z.string().min(1, { message: 'Hub name is required' }),
  description: z.string().optional(),
  hubStatus: z.nativeEnum(HubStatusEnum),
  acquisitionDate: z.date({ message: 'Acquisition date is required' }),
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  dataTransmissionInterval: z.number().min(0).optional(),
  supplier: z.string().min(1, { message: 'Supplier is required' }),
  supplierContactNumber: z.string().min(1, { message: 'Supplier contact number is required' }),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  radioGroup: z.number().int().optional(),
  hubSecret: z.string().optional(),
  images: z.array(z.string()).optional(),
  lat: z.number().min(-90).max(90).optional(),
  long: z.number().min(-180).max(180).optional(),
  remarks: z.string().optional(),
  zoneId: z.number().int().optional(),
  facilityId: z.string().uuid().optional(),
  lastDataUpdateDate: z.date().optional(),
});

export type HubSchemaType = z.infer<typeof HubSchema>;
