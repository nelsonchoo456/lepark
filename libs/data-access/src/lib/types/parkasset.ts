import { FacilityResponse } from './facility';
import { MaintenanceHistoryResponse } from './maintenancehistory';
import { ParkResponse } from './park';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from './sharedenums';

export interface ParkAssetData {
  name: string;
  serialNumber: string;
  parkAssetType: ParkAssetTypeEnum;
  description?: string;
  parkAssetStatus: ParkAssetStatusEnum;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
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
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  supplier: string;
  supplierContactNumber: string;
  parkAssetCondition: ParkAssetConditionEnum;
  images?: string[];
  remarks?: string;
  facilityId: string;
  facility?: FacilityResponse;
  parkName?: string;
  park?: ParkResponse;
  maintenanceHistory?: MaintenanceHistoryResponse[];
}

export interface ParkAssetUpdateData {
  name?: string;
  serialNumber?: string;
  parkAssetType?: ParkAssetTypeEnum;
  description?: string;
  parkAssetStatus?: ParkAssetStatusEnum;
  acquisitionDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  supplier?: string;
  supplierContactNumber?: string;
  parkAssetCondition?: ParkAssetConditionEnum;
  images?: string[];
  remarks?: string;
  facilityId?: string;
}
