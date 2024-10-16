// FeedbackSchema.ts
import { z } from 'zod';

export const FeedbackSchema = z.object({
  id: z.string().uuid().optional(),
  dateCreated: z.date().optional(),
  dateResolved: z.date().optional().nullable(),
  title: z.string(),
  description: z.string(),
  feedbackCategory: z.enum(['FACILITIES', 'SERVICES', 'STAFF']),
  images: z.array(z.string()),
  feedbackStatus: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  remarks: z.string().optional().nullable(),
  staffId: z.string().uuid().optional().nullable(),
  visitorId: z.string().uuid(),
});

export type FeedbackSchemaType = z.infer<typeof FeedbackSchema>;
