import { z } from 'zod';
import { OccurrenceStatusEnum } from '@prisma/client';

export const StatusLogSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  dateCreated: z.date(),
  images: z.array(z.string()).optional(),
  statusLogType: z.nativeEnum(OccurrenceStatusEnum),
  occurrenceId: z.string().uuid(),
});

export type StatusLogSchemaType = z.infer<typeof StatusLogSchema>;
