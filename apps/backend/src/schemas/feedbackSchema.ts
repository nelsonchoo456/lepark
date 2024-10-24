import { z } from 'zod';
import { FeedbackCategoryEnum, FeedbackStatusEnum } from '@prisma/client';

export const FeedbackSchema = z.object({
  id: z.string().uuid().optional(),
  dateCreated: z.date().optional(),
  dateResolved: z.date().optional().nullable(),
  title: z.string(),
  description: z.string(),
  feedbackCategory: z.nativeEnum(FeedbackCategoryEnum),
  images: z.array(z.string()),
  feedbackStatus: z.nativeEnum(FeedbackStatusEnum),
  remarks: z.string().optional().nullable(),
  staffId: z.string().uuid().optional().nullable(),
  visitorId: z.string().uuid(),
  parkId: z.number(),
  needResponse: z.boolean(),
});

export type FeedbackSchemaType = z.infer<typeof FeedbackSchema>;
