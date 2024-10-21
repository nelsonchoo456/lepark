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
  position: number; // Add this line
}

export interface PlantTaskUpdateData {
  title?: string;
  description?: string;
  taskType?: PlantTaskTypeEnum;
  taskUrgency?: PlantTaskUrgencyEnum;
  dueDate?: string | null;
  images?: string[];
  position?: number; // Add this line
}

export interface CompletionRateData {
  staff: StaffResponse;
  completionRate: number;
}

export interface OverdueRateData {
  staff: StaffResponse;
  overdueRate: number;
}

export interface AverageCompletionTimeData {
  staff: StaffResponse;
  averageCompletionTime: number;
}

export interface TaskLoadPercentageData {
  staff: StaffResponse;
  taskLoadPercentage: number;
}

export interface StaffPerformanceRankingData {
  bestPerformer: StaffResponse | null;
  secondBestPerformer: StaffResponse | null;
  thirdBestPerformer: StaffResponse | null;
  message?: string;
}

export interface ParkTaskCompletedData {
  staff: StaffResponse;
  taskCompleted: number;
}
export interface ParkStaffAverageCompletionTimeForPastMonthsData {
  staff: StaffResponse;
  averageCompletionTimes: number[];
}

export interface ParkStaffCompletionRatesForPastMonthsData {
  staff: StaffResponse;
  completionRates: number[];
}

export interface ParkStaffOverdueRatesForPastMonthsData {
  staff: StaffResponse;
  overdueRates: number[];
}

export interface ParkStaffTasksCompletedForPastMonthsData {
  staff: StaffResponse;
  tasksCompleted: number[];
}
