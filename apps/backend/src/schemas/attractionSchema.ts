import { AttractionStatusEnum, AttractionTicketCategoryEnum, AttractionTicketNationalityEnum } from '@prisma/client';
import { z } from 'zod';

export const AttractionSchema = z.object({
  title: z.string(),
  description: z.string(),
  openingHours: z.array(z.date()),
  closingHours: z.array(z.date()),
  images: z.array(z.string()).optional(),
  status: z.nativeEnum(AttractionStatusEnum),
  maxCapacity: z.number(),
  ticketingPolicy: z.string(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  parkId: z.number(),

  cameraSensorId: z.string().optional(),
});

export const AttractionTicketListingSchema = z.object({
  category: z.nativeEnum(AttractionTicketCategoryEnum),
  nationality: z.nativeEnum(AttractionTicketNationalityEnum),
  description: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  attractionId: z.string()
});

export type AttractionSchemaType = z.infer<typeof AttractionSchema>;
export type AttractionTicketListingSchemaType = z.infer<typeof AttractionTicketListingSchema>;