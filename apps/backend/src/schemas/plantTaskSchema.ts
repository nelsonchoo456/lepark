import { z } from 'zod';
import { PlantTaskStatusEnum, PlantTaskTypeEnum, PlantTaskUrgencyEnum } from '@prisma/client';

export const PlantTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string(),
  taskStatus: z.nativeEnum(PlantTaskStatusEnum),
  taskType: z.nativeEnum(PlantTaskTypeEnum),
  taskUrgency: z.nativeEnum(PlantTaskUrgencyEnum),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  dueDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
  images: z.array(z.string()).optional(),
  remarks: z.string().optional().nullable(),
  occurrenceId: z.string().uuid(),
  assignedStaffId: z.string().uuid().optional().nullable(),
  submittingStaffId: z.string().uuid(),
  position: z.number().optional(),
});

export type PlantTaskSchemaType = z.infer<typeof PlantTaskSchema>;
