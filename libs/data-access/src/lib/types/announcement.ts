export enum AnnouncementStatusEnum {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  updatedAt: any;
  startDate: any;
  endDate: any;
  status: AnnouncementStatusEnum;
  parkId?: number;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  updatedAt: any;
  startDate: any;
  endDate: any;
  status: AnnouncementStatusEnum;
  parkId?: number;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  updatedAt?: any;
  startDate?: any;
  endDate?: any;
  status?: AnnouncementStatusEnum;
  parkId?: number;
}
