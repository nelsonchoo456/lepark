import { MaintenanceHistoryResponse } from './maintenancehistory';
import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from './sharedenums';

export interface ParkAssetData {
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
}

export interface ParkAssetResponse {
  id: string;
  serialNumber: string; // Add this line
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
  facility?: {
    id: string;
    name: string;
    parkId: number;
  };
  parkName: string;
  maintenanceHistory?: MaintenanceHistoryResponse[];
}

export interface ParkAssetUpdateData {
  name?: string;
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
