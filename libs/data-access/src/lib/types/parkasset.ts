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
  images?: string[];
  remarks?: string;
  //facilityId: string;
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
  images?: string[];
  remarks?: string;
  //maintenanceHistory?: MaintenanceHistoryResponse[];
  //facilityId: string;
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
  //facilityId?: string;
}
