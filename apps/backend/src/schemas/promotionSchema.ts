import { DiscountTypeEnum, PromotionStatusEnum } from '@prisma/client';
import { z } from 'zod';

export const PromotionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountTypeEnum),
  promoCode: z.string().optional(),
  isNParksWide: z.boolean(),
  parkId: z.number().optional(),
  images: z.array(z.string()).optional(),
  discountValue: z.number().min(0.01),
  validFrom: z.date(),
  validUntil: z.date(),
  status: z.nativeEnum(PromotionStatusEnum),
  terms: z.array(z.string()).optional(),
  maximumUsage: z.number().min(1).optional(),
  minimumAmount: z.number().min(0.01).optional(),
});

export type PromotionSchemaType = z.infer<typeof PromotionSchema>;