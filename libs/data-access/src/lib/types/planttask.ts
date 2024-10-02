import { PlantTaskStatusEnum, PlantTaskTypeEnum, PlantTaskUrgencyEnum } from './sharedenums';
import { StaffType } from './staff';

export interface PlantTaskData {
  title: string;
  description: string;
  taskType: PlantTaskTypeEnum;
  taskUrgency: PlantTaskUrgencyEnum;
  images: string[];
  occurrenceId: string;
  assignedStaffId?: string | null;
  submittingStaffId: string;
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
    role: StaffType;
  };
  parkId: number;
  zoneName?: string;
  submittingStaffId: string;
  submittingStaff: {
    id: string;
    firstName: string;
    lastName: string;
    role: StaffType;
  };
}

export interface PlantTaskUpdateData {
  title?: string;
  description?: string;
  taskType?: PlantTaskTypeEnum;
  taskUrgency?: PlantTaskUrgencyEnum;
  images?: string[];
}
