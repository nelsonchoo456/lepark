// feedback.ts
import { StaffResponse } from './staff';
import { VisitorResponse } from './visitor';

export interface FeedbackData {
  title: string;
  description: string;
  feedbackCategory: 'FACILITIES' | 'SERVICES' | 'STAFF';
  images: string[];
  feedbackStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  remarks?: string | null;
  staffId?: string | null;
  visitorId: string;
}

export interface FeedbackResponse {
  id: string;
  dateCreated: string;
  dateResolved?: string | null;
  title: string;
  description: string;
  feedbackCategory: 'FACILITIES' | 'SERVICES' | 'STAFF';
  images: string[];
  feedbackStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  remarks?: string | null;
  staffId?: string | null;
  visitorId: string;
  visitor: VisitorResponse;
  staff?: StaffResponse;
}

export interface FeedbackUpdateData {
  title?: string;
  description?: string;
  feedbackCategory?: 'FACILITIES' | 'SERVICES' | 'STAFF';
  images?: string[];
  feedbackStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  remarks?: string | null;
  staffId?: string | null;
}
