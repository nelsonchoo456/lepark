import { OccurrenceStatusEnum } from './sharedEnums';

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
