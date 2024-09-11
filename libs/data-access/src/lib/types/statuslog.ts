export enum OccurrenceStatusEnum {
    HEALTHY = 'HEALTHY',
    MONITOR_AFTER_TREATMENT = 'MONITOR_AFTER_TREATMENT',
    NEEDS_ATTENTION = 'NEEDS_ATTENTION',
    URGENT_ACTION_REQUIRED = 'URGENT_ACTION_REQUIRED',
    REMOVED = 'REMOVED',
  }
  
  export interface StatusLogData {
    name: string;
    description: string;
    dateCreated: string;
    images?: string[];
    statusLogType: OccurrenceStatusEnum;
    occurrenceId: string;
  }
  
  export interface StatusLogResponse {
    id: string;
    name: string;
    description: string;
    dateCreated: string;
    images: string[];
    statusLogType: OccurrenceStatusEnum;
    occurrenceId: string;
  }
  
  export interface StatusLogUpdateData {
    name?: string;
    description?: string;
    dateCreated?: string;
    images?: string[];
    statusLogType?: OccurrenceStatusEnum;
  }