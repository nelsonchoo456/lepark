import { PlantTaskStatusEnum, PlantTaskTypeEnum, PlantTaskUrgencyEnum } from './sharedenums';

export interface PlantTaskData {
  title: string;
  description: string;
  taskType: PlantTaskTypeEnum;
  taskUrgency: PlantTaskUrgencyEnum;
  images?: string[];
  occurrenceId: string;
  assignedStaffId?: string | null;
}

export interface PlantTaskResponse {
  id: string;
  title: string;
  description: string;
  taskStatus: PlantTaskStatusEnum;
  taskType: PlantTaskTypeEnum;
  taskUrgency: PlantTaskUrgencyEnum;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  completedDate: string | null;
  images: string[];
  remarks: string | null;
  occurrenceId: string;
  occurrence: {
    id: string;
    title: string;
  };
  assignedStaffId: string | null;
  assignedStaff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  parkId: number;
  zoneName?: string;
}

export interface PlantTaskUpdateData {
  title?: string;
  description?: string;
  taskStatus?: PlantTaskStatusEnum;
  taskType?: PlantTaskTypeEnum;
  taskUrgency?: PlantTaskUrgencyEnum;
  completedDate?: string | null;
  images?: string[];
  remarks?: string | null;
  assignedStaffId?: string | null;
}
