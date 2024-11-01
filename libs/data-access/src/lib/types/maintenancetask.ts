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
  taskStatus?: MaintenanceTaskStatusEnum;
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

export interface OverdueRateMaintenanceTaskData {
  taskType: MaintenanceTaskTypeEnum;
  overdueRate: number;
}

export interface DelayedTaskTypeData {
  rank: number;
  taskType: MaintenanceTaskTypeEnum;
  averageCompletionTime: number;
  overdueTaskCount: number;
  completedTaskCount: number;
}

export interface ParkTaskTypeAverageCompletionTimesForPastMonthsData {
  taskType: MaintenanceTaskTypeEnum;
  averageCompletionTimes: number[];
}

export interface ParkTaskTypeOverdueRatesForPastMonthsData {
  taskType: MaintenanceTaskTypeEnum;
  overdueRates: number[];
}
