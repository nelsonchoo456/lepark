import { z } from 'zod';
import { ActivityLogTypeEnum } from '@prisma/client';

export const ActivityLogSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  dateCreated: z.date(),
  images: z.array(z.string()).optional(),
  activityLogType: z.nativeEnum(ActivityLogTypeEnum),
  occurrenceId: z.string().uuid(),
});

export type ActivityLogSchemaType = z.infer<typeof ActivityLogSchema>;
