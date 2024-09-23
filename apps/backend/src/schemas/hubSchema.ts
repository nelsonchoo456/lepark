import { z } from 'zod';
import { HubStatusEnum } from '@prisma/client';

export const HubSchema = z.object({
  id: z.string().uuid().optional(), // ID is optional because it's usually auto-generated
  serialNumber: z.string().min(1, { message: 'Serial number is required' }),
  name: z.string().min(1, { message: 'Hub name is required' }),
  description: z.string().optional(),
  hubStatus: z.nativeEnum(HubStatusEnum),
  acquisitionDate: z.date({ message: 'Acquisition date is required' }),
  //lastCalibratedDate: z.date({ message: 'Last calibrated date is required' }),
  recommendedCalibrationFrequencyDays: z.number().int().min(1, { message: 'Calibration frequency must be a positive integer' }),
  recommendedMaintenanceDuration: z.number().int().min(1, { message: 'Recurring maintenance duration must be a positive integer' }),
  //lastMaintenanceDate: z.date({ message: 'Last maintenance date is required' }),
  nextMaintenanceDate: z.date().optional(),
  dataTransmissionInterval: z.number().min(0, { message: 'Data transmission interval must be a non-negative number' }),
  ipAddress: z.string().min(1, { message: 'IP address is required' }),
  macAddress: z.string().min(1, { message: 'MAC address is required' }),
  radioGroup: z.number().int().min(1, { message: 'Radio group must be a positive integer' }),
  hubSecret: z.string().min(1, { message: 'Hub secret is required' }),
  images: z.array(z.string()),
  lat: z.number().min(-90).max(90).optional(),
  long: z.number().min(-180).max(180).optional(),
  remarks: z.string().optional(),
  zoneId: z.number().int().optional(),
  facilityId: z.string().optional(),
});

export type HubSchemaType = z.infer<typeof HubSchema>;
