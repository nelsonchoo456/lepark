import { StaffResponse } from './staff';
import { VisitorResponse } from './visitor';
import { FacilityResponse } from './facility';
import { OccurrenceResponse } from './occurrence';

export interface Feedback {
  id: string;
  dateCreated: string;
  dateResolved?: string;
  title: string;
  description: string;
  feedbackCategory: 'FACILITY' | 'PLANT' | 'GENERAL';
  images: string[];
  feedbackStatus: 'PENDING' | 'IN_PROGRESS' | 'REJECTED' | 'RESOLVED';
  remarks: string;
  staffId?: string;
  visitorId: string;
  facilityId?: string;
  occurrenceId?: string;
  staff?: StaffResponse;
  visitor: VisitorResponse;
  facility?: FacilityResponse;
  occurrence?: OccurrenceResponse;
}

export interface CreateFeedbackData {
  title: string;
  description: string;
  feedbackCategory: 'FACILITY' | 'PLANT' | 'GENERAL';
  images: string[];
  visitorId: string;
  facilityId?: string;
  occurrenceId?: string;
}

export interface UpdateFeedbackData {
  title?: string;
  description?: string;
  feedbackCategory?: 'FACILITY' | 'PLANT' | 'GENERAL';
  images?: string[];
  feedbackStatus?: 'PENDING' | 'IN_PROGRESS' | 'REJECTED' | 'RESOLVED';
  remarks?: string;
  dateResolved?: string;
}
