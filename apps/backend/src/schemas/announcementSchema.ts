import { AnnouncementStatusEnum } from '@prisma/client';
import { z } from 'zod';

export const AnnouncementSchema = z.object({
  title: z.string(),
  content: z.string(),
  updatedAt: z.date(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(AnnouncementStatusEnum),
  parkId: z.number().nullable().optional(),
});

export type AnnouncementSchemaType = z.infer<typeof AnnouncementSchema>;
