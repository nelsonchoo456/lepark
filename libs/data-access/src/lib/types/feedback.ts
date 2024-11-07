// feedback.ts
import { FeedbackCategoryEnum, FeedbackStatusEnum } from './sharedEnums';
import { StaffResponse } from './staff';
import { VisitorResponse } from './visitor';

export interface FeedbackData {
  title: string;
  description: string;
  feedbackCategory: FeedbackCategoryEnum;
  images: string[];
  feedbackStatus: FeedbackStatusEnum;
  remarks?: string | null;
  resolvedStaffId?: string | null;
  visitorId: string;
  parkId: number;
  needResponse: boolean;
}

export interface FeedbackResponse {
  id: string;
  dateCreated: string;
  dateResolved?: string | null;
  title: string;
  description: string;
  feedbackCategory: FeedbackCategoryEnum;
  images: string[];
  feedbackStatus: FeedbackStatusEnum;
  remarks?: string | null;
  resolvedStaffId?: string | null;
  visitorId: string;
  visitor: VisitorResponse;
  resolvedStaff?: StaffResponse;
  parkId: number;
  needResponse: boolean;
}

export interface FeedbackUpdateData {
  title?: string;
  description?: string;
  feedbackCategory?: FeedbackCategoryEnum;
  images?: string[];
  feedbackStatus?: FeedbackStatusEnum;
  remarks?: string | null;
  resolvedStaffId?: string | null;
  parkId?: number | null;
  dateResolved?: string | null;
  needResponse?: boolean;
}
