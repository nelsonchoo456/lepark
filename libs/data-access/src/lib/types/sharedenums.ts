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