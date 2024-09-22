import { AttractionStatusEnum } from '@prisma/client';
import { z } from 'zod';

export const AttractionSchema = z.object({
  title: z.string(),
  description: z.string(),
  openingHours: z.array(z.date()),
  closingHours: z.array(z.date()),
  images: z.array(z.string()).optional(),
  status: z.nativeEnum(AttractionStatusEnum),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  parkId: z.number()
});

export type AttractionSchemaType = z.infer<typeof AttractionSchema>;