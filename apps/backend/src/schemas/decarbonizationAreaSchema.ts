import { z } from 'zod';

export const DecarbonizationAreaCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional(),
  geom: z.string().min(1, 'Geometry is required'),
  parkId: z.number()
});

export const DecarbonizationAreaUpdateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  description: z.string().optional(),
  geom: z.string().min(1, 'Geometry is required').optional(),
  parkId: z.number().optional()
});

export type DecarbonizationAreaCreateData = z.infer<typeof DecarbonizationAreaCreateSchema>;
export type DecarbonizationAreaUpdateData = z.infer<typeof DecarbonizationAreaUpdateSchema>;
