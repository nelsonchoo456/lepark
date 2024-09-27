import { z } from 'zod';

export const SequestrationHistorySchema = z.object({
  date: z.date({ message: 'Date is required' }),
  seqValue: z.number().min(0, 'Sequestration value must be a positive number'),
  decarbonizationAreaId: z.string().uuid('Invalid decarbonization area ID'),
});

export type SequestrationHistorySchemaType = z.infer<typeof SequestrationHistorySchema>;