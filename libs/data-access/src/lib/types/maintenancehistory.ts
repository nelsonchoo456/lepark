import { ParkAssetTypeEnum, ParkAssetStatusEnum, ParkAssetConditionEnum } from './sharedenums';

export interface MaintenanceHistoryData {
  hubId?: string;
  sensorId?: string;
  assetId?: string;
  maintenanceDate: string;
  description: string;
}

export interface MaintenanceHistoryResponse {
  id: string;
  hubId?: string;
  sensorId?: string;
  assetId?: string;
  maintenanceDate: string;
  description: string;
  hub?: {
    id: string;
    hubName: string;
    // Add other relevant hub fields
  };
  sensor?: {
    id: string;
    // Add relevant sensor fields
  };
  parkAsset?: {
    id: string;
    parkAssetName: string;
    parkAssetType: ParkAssetTypeEnum;
    parkAssetStatus: ParkAssetStatusEnum;
    parkAssetCondition: ParkAssetConditionEnum;
    // Add other relevant park asset fields
  };
}

export interface MaintenanceHistoryUpdateData {
  hubId?: string;
  sensorId?: string;
  assetId?: string;
  maintenanceDate?: string;
  description?: string;
}
