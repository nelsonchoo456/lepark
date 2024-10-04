import { OccurrenceResponse } from './occurrence';
import { PlantTaskStatusEnum, PlantTaskTypeEnum, PlantTaskUrgencyEnum } from './sharedenums';
import { StaffResponse } from './staff';
import { ZoneResponse } from './zone';
import { ParkResponse } from './park';

export interface PlantTaskData {
  title: string;
  description: string;
  taskType: PlantTaskTypeEnum;
  taskUrgency: PlantTaskUrgencyEnum;
  dueDate: string | null;
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
  occurrence: OccurrenceResponse & {
    zone: ZoneResponse & {
      park: ParkResponse;
    };
  };
  assignedStaffId: string | null;
  assignedStaff?: StaffResponse;
  submittingStaffId: string;
  submittingStaff: StaffResponse;
}

export interface PlantTaskUpdateData {
  title?: string;
  description?: string;
  taskType?: PlantTaskTypeEnum;
  taskUrgency?: PlantTaskUrgencyEnum;
  dueDate?: string | null;
  images?: string[];
}
