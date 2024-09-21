import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from './sharedenums';

export interface ParkAssetData {
  parkAssetName: string;
  parkAssetType: ParkAssetTypeEnum;
  parkAssetDescription?: string;
  parkAssetStatus: ParkAssetStatusEnum;
  acquisitionDate: string;
  recurringMaintenanceDuration: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  supplier: string;
  supplierContactNumber: string;
  parkAssetCondition: ParkAssetConditionEnum;
  images: string[];
  remarks?: string;
  facilityId: string;
}

export interface ParkAssetResponse {
  id: string;
  parkAssetName: string;
  parkAssetType: ParkAssetTypeEnum;
  parkAssetDescription?: string;
  parkAssetStatus: ParkAssetStatusEnum;
  acquisitionDate: string;
  recurringMaintenanceDuration: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  supplier: string;
  supplierContactNumber: string;
  parkAssetCondition: ParkAssetConditionEnum;
  images: string[];
  remarks?: string;
  facilityId: string;
  facilityName: string;
  parkId: number;
  //maintenanceHistory?: MaintenanceHistoryResponse[];
}

export interface ParkAssetUpdateData {
  parkAssetName?: string;
  parkAssetType?: ParkAssetTypeEnum;
  parkAssetDescription?: string;
  parkAssetStatus?: ParkAssetStatusEnum;
  acquisitionDate?: string;
  recurringMaintenanceDuration?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  supplier?: string;
  supplierContactNumber?: string;
  parkAssetCondition?: ParkAssetConditionEnum;
  images?: string[];
  remarks?: string;
  facilityId?: string;
}
