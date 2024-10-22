import { MaintenanceTaskStatusEnum, MaintenanceTaskTypeEnum, MaintenanceTaskUrgencyEnum } from './sharedenums';
import { StaffResponse } from './staff';
import { FacilityResponse } from './facility';
import { ParkAssetResponse } from './parkasset';
import { SensorResponse } from './sensor';
import { HubResponse } from './hub';
import { ParkResponse } from './park';

export interface MaintenanceTaskData {
  title: string;
  description: string;
  taskType: MaintenanceTaskTypeEnum;
  taskUrgency: MaintenanceTaskUrgencyEnum;
  dueDate: string | null;
  images: string[];
  facilityId?: string;
  parkAssetId?: string;
  sensorId?: string;
  hubId?: string;
  assignedStaffId?: string | null;
  submittingStaffId: string;
}

export interface MaintenanceTaskResponse {
  id: string;
  title: string;
  description: string;
  taskStatus: MaintenanceTaskStatusEnum;
  taskType: MaintenanceTaskTypeEnum;
  taskUrgency: MaintenanceTaskUrgencyEnum;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  completedDate: string | null;
  images: string[];
  remarks: string | null;
  facilityId: string | null;
  facility?: FacilityResponse;
  parkAssetId: string | null;
  parkAsset?: ParkAssetResponse;
  sensorId: string | null;
  sensor?: SensorResponse;
  hubId: string | null;
  hub?: HubResponse;
  assignedStaffId: string | null;
  assignedStaff?: StaffResponse;
  submittingStaffId: string;
  submittingStaff: StaffResponse;
  position: number;
  facilityOfFaultyEntity: FacilityResponse & { park: ParkResponse };
}

export interface MaintenanceTaskUpdateData {
  title?: string;
  description?: string;
  taskType?: MaintenanceTaskTypeEnum;
  taskUrgency?: MaintenanceTaskUrgencyEnum;
  dueDate?: string | null;
  images?: string[];
  position?: number;
}

export interface CompletionTimeData {
  taskType: MaintenanceTaskTypeEnum;
  averageCompletionTime: number;
}

export interface OverdueRateData {
  taskType: MaintenanceTaskTypeEnum;
  overdueRate: number;
}

//   staff: StaffResponse;
//   overdueRate: number;
// }

// export interface AverageCompletionTimeData {
//   staff: StaffResponse;
//   averageCompletionTime: number;
// }

// export interface TaskLoadPercentageData {
//   staff: StaffResponse;
//   taskLoadPercentage: number;
// }

// export interface StaffPerformanceRankingData {
//   bestPerformer: StaffResponse | null;
//   secondBestPerformer: StaffResponse | null;
//   thirdBestPerformer: StaffResponse | null;
//   message?: string;
// }

// export interface ParkTaskCompletedData {
//   staff: StaffResponse;
//   taskCompleted: number;
// }

// export interface ParkStaffAverageCompletionTimeForPastMonthsData {
//   staff: StaffResponse;
//   averageCompletionTimes: number[];
// }

// export interface ParkStaffCompletionRatesForPastMonthsData {
//   staff: StaffResponse;
//   completionRates: number[];
// }

// export interface ParkStaffOverdueRatesForPastMonthsData {
//   staff: StaffResponse;
//   overdueRates: number[];
// }

// export interface ParkStaffTasksCompletedForPastMonthsData {
//   staff: StaffResponse;
//   tasksCompleted: number[];
// }