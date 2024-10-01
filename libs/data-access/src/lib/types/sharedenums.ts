export enum OccurrenceStatusEnum {
  HEALTHY = 'HEALTHY',
  MONITOR_AFTER_TREATMENT = 'MONITOR_AFTER_TREATMENT',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  URGENT_ACTION_REQUIRED = 'URGENT_ACTION_REQUIRED',
  REMOVED = 'REMOVED',
}

export enum PlantTaskStatusEnum {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PlantTaskTypeEnum {
  INSPECTION = 'INSPECTION',
  WATERING = 'WATERING',
  PRUNING_TRIMMING = 'PRUNING_TRIMMING',
  PEST_MANAGEMENT = 'PEST_MANAGEMENT',
  SOIL_MAINTENANCE = 'SOIL_MAINTENANCE',
  STAKING_SUPPORTING = 'STAKING_SUPPORTING',
  DEBRIS_REMOVAL = 'DEBRIS_REMOVAL',
  ENVIRONMENTAL_ADJUSTMENT = 'ENVIRONMENTAL_ADJUSTMENT',
  OTHERS = 'OTHERS'
}

export enum PlantTaskUrgencyEnum {
  IMMEDIATE = 'IMMEDIATE',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}
export enum ParkAssetTypeEnum {
  PLANT_TOOL_AND_EQUIPMENT = 'PLANT_TOOL_AND_EQUIPMENT',
  HOSES_AND_PIPES = 'HOSES_AND_PIPES',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  LANDSCAPING = 'LANDSCAPING',
  GENERAL_TOOLS = 'GENERAL_TOOLS',
  SAFETY = 'SAFETY',
  DIGITAL = 'DIGITAL',
  EVENT = 'EVENT',
}

export enum ParkAssetStatusEnum {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum ParkAssetConditionEnum {
  EXCELLENT = 'EXCELLENT',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
}

export enum HubStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum SensorTypeEnum {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  SOIL_MOISTURE = 'SOIL_MOISTURE',
  LIGHT = 'LIGHT',
  CAMERA = 'CAMERA',  
}

export enum SensorStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum SensorUnitEnum {
  PERCENT = 'PERCENT',
  DEGREES_CELSIUS = 'DEGREES_CELSIUS',
  VOLUMETRIC_WATER_CONTENT = 'VOLUMETRIC_WATER_CONTENT',
  LUX = 'LUX',
  PAX = 'PAX',
  // Add other units as needed
}
