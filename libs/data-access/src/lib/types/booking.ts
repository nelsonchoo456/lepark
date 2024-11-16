import { FacilityResponse } from './facility';
import { VisitorResponse } from './visitor';

export enum BookingStatusEnum {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  APPROVED_PENDING_PAYMENT = 'APPROVED_PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
}

export interface BookingResponse {
  id: string;
  bookingPurpose: string;
  pax: number;
  bookingStatus: BookingStatusEnum;
  dateStart: Date;
  dateEnd: Date;
  dateBooked: Date;
  paymentDeadline: Date;
  visitorRemarks?: string;
  facilityId: string;
  visitorId: string;
  facility?: FacilityResponse;
  visitor?: VisitorResponse;
}

export interface CreateBookingData {
  bookingPurpose: string;
  pax: number;
  dateStart: Date;
  dateEnd: Date;
  dateBooked: Date;
  paymentDeadline?: Date;
  visitorRemarks?: string;
  facilityId: string;
  visitorId: string;
  bookingStatus: BookingStatusEnum;
}

export interface UpdateBookingStatusData {
  status: BookingStatusEnum;
}

export interface SendBookingEmailData {
  bookingId: string;
  recipientEmail: string;
}
