import { z } from 'zod';
import { MaintenanceTaskStatusEnum, MaintenanceTaskTypeEnum, MaintenanceTaskUrgencyEnum } from '@prisma/client';

export const MaintenanceTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string(),
  taskStatus: z.nativeEnum(MaintenanceTaskStatusEnum),
  taskType: z.nativeEnum(MaintenanceTaskTypeEnum),
  taskUrgency: z.nativeEnum(MaintenanceTaskUrgencyEnum),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  dueDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
  images: z.array(z.string()).optional(),
  remarks: z.string().optional().nullable(),
  assignedStaffId: z.string().uuid().optional().nullable(),
  submittingStaffId: z.string().uuid(),
  position: z.number().optional(),
  facilityId: z.string().uuid().optional().nullable(),
  parkAssetId: z.string().uuid().optional().nullable(),
  sensorId: z.string().uuid().optional().nullable(),
  hubId: z.string().uuid().optional().nullable(),
}).refine(
  (data) => {
    const entityCount = [data.facilityId, data.parkAssetId, data.sensorId, data.hubId].filter(Boolean).length;
    return entityCount === 1;
  },
  {
    message: "Exactly one of facilityId, parkAssetId, sensorId, or hubId must be provided",
    path: ["facilityId", "parkAssetId", "sensorId", "hubId"],
  }
);

export type MaintenanceTaskSchemaType = z.infer<typeof MaintenanceTaskSchema>;