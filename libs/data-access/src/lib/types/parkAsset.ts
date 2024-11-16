import { MaintenanceTaskResponse } from '@lepark/data-access';
import { FacilityResponse } from './facility';
import { ParkResponse } from './park';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from './sharedEnums';

export interface ParkAssetData {
  name: string;
  serialNumber?: string;
  parkAssetType: ParkAssetTypeEnum;
  description?: string;
  parkAssetStatus: ParkAssetStatusEnum;
  acquisitionDate: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
  supplier: string;
  supplierContactNumber: string;
  parkAssetCondition: ParkAssetConditionEnum;
  images?: string[];
  remarks?: string;
  facilityId?: string;
}

export interface ParkAssetResponse {
  id: string;
  identifierNumber: string;
  serialNumber: string;
  name: string;
  parkAssetType: ParkAssetTypeEnum;
  description?: string;
  parkAssetStatus: ParkAssetStatusEnum;
  acquisitionDate: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
  supplier: string;
  supplierContactNumber: string;
  parkAssetCondition: ParkAssetConditionEnum;
  images?: string[];
  remarks?: string;
  facilityId: string;
  facility?: FacilityResponse;
  parkName?: string;
  park?: ParkResponse;
  maintenanceTasks?: MaintenanceTaskResponse[];
}

export interface ParkAssetUpdateData {
  name?: string;
  serialNumber?: string;
  parkAssetType?: ParkAssetTypeEnum;
  description?: string;
  parkAssetStatus?: ParkAssetStatusEnum;
  acquisitionDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
  supplier?: string;
  supplierContactNumber?: string;
  parkAssetCondition?: ParkAssetConditionEnum;
  images?: string[];
  remarks?: string;
  facilityId?: string;
}
