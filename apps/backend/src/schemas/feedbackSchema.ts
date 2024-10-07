import { z } from 'zod';
import { FeedbackCategoryEnum, FeedbackStatusEnum } from '@prisma/client';

export const FeedbackSchema = z.object({
  id: z.string().uuid().optional(),
  dateCreated: z.date().optional(),
  dateResolved: z.date().optional(),
  title: z.string(),
  description: z.string(),
  feedbackCategory: z.nativeEnum(FeedbackCategoryEnum),
  images: z.array(z.string()),
  feedbackStatus: z.nativeEnum(FeedbackStatusEnum),
  remarks: z.string().optional(),
  staffId: z.string().uuid().optional(),
  visitorId: z.string().uuid(),
  facilityId: z.string().uuid().optional(),
  occurrenceId: z.string().uuid().optional(),
});

export type FeedbackSchemaType = z.infer<typeof FeedbackSchema>;