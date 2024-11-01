import { FacilityResponse } from './facility';
import { HubResponse } from './hub';
import { ParkResponse } from './park';
import { SensorReadingResponse } from './sensorreading';
import { SensorStatusEnum, SensorTypeEnum, SensorUnitEnum } from './sharedenums';

export interface SensorData {
  name: string;
  serialNumber: string;
  sensorType: SensorTypeEnum;
  description?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
}

export interface SensorResponse {
  id: string;
  name: string;
  serialNumber: string;
  identifierNumber: string;
  sensorType: SensorTypeEnum;
  description?: string;
  sensorStatus: SensorStatusEnum;
  acquisitionDate: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
  sensorUnit: SensorUnitEnum;
  supplier: string;
  supplierContactNumber: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string | null;
  hubId?: string;
  facilityId?: string;
  hub?: HubResponse;
  facility?: FacilityResponse;
  park?: ParkResponse;
  parkName?: string;
  sensorReadings?: SensorReadingResponse[];
}

export interface SensorUpdateData {
  name?: string;
  serialNumber?: string;
  sensorType?: SensorTypeEnum;
  description?: string;
  sensorStatus?: SensorStatusEnum;
  acquisitionDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceDates?: string[];
  sensorUnit?: SensorUnitEnum;
  supplier?: string;
  supplierContactNumber?: string;
  images?: string[];
  lat?: number;
  long?: number;
  remarks?: string;
  hubId?: string;
  facilityId?: string;
}
