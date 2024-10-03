import { AnnouncementStatusEnum } from '@prisma/client';
import { z } from 'zod';

export const AnnouncementSchema = z.object({
  title: z.string(),
  content: z.string(),
  updatedAt: z.array(z.date()),
  startDate: z.array(z.date()),
  endDate: z.array(z.date()),
  status: z.nativeEnum(AnnouncementStatusEnum),
  parkId: z.number().optional(),
});

export type AnnouncementSchemaType = z.infer<typeof AnnouncementSchema>;
