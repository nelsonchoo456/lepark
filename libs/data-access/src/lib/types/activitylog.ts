export enum ActivityLogTypeEnum {
  WATERED = 'WATERED',
  TRIMMED = 'TRIMMED',
  FERTILIZED = 'FERTILIZED',
  PRUNED = 'PRUNED',
  REPLANTED = 'REPLANTED',
  CHECKED_HEALTH = 'CHECKED_HEALTH',
  TREATED_PESTS = 'TREATED_PESTS',
  SOIL_REPLACED = 'SOIL_REPLACED',
  HARVESTED = 'HARVESTED',
  STAKED = 'STAKED',
  MULCHED = 'MULCHED',
  MOVED = 'MOVED',
  CHECKED = 'CHECKED',
  ADDED_COMPOST = 'ADDED_COMPOST',
  OTHERS = 'OTHERS',
}

export interface ActivityLogData {
  name: string;
  description: string;
  dateCreated: string;
  images?: string[];
  activityLogType: ActivityLogTypeEnum;
  occurrenceId: string;
}

export interface ActivityLogResponse {
  id: string;
  name: string;
  description: string;
  dateCreated: string;
  images: string[];
  activityLogType: ActivityLogTypeEnum;
  occurrenceId: string;
}

export interface ActivityLogUpdateData {
  name?: string;
  description?: string;
  dateCreated?: string;
  images?: string[];
  activityLogType?: ActivityLogTypeEnum;
}
