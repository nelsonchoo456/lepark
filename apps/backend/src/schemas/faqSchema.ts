import { FAQCategoryEnum, FAQStatusEnum } from '@prisma/client';
import { z } from 'zod';

export const FAQSchema = z.object({
  category: z.nativeEnum(FAQCategoryEnum),
  question: z.string().min(3, 'Question must be at least 3 characters long'),
  answer: z.string().min(3, 'Answer must be at least 3 characters long'),
  status: z.nativeEnum(FAQStatusEnum),
  parkId: z.number().optional(),
  priority: z.number().optional(),
});


export type FAQSchemaType = z.infer<typeof FAQSchema>;