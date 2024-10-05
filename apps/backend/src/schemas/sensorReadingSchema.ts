import { z } from 'zod';

export const SensorReadingSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.date(),
  value: z.number(),
  sensorId: z.string().uuid()
});

export type SensorReadingSchemaType = z.infer<typeof SensorReadingSchema>;