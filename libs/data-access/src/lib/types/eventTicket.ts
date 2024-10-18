import { EventResponse, EventTicketListingResponse } from './event';
import { VisitorResponse } from './visitor';

export enum EventTicketStatusEnum {
  VALID = 'VALID',
  INVALID = 'INVALID',
  USED = 'USED',
}

export interface EventTicketTransactionResponse {
  id: string;
  eventDate: Date;
  purchaseDate: Date;
  totalAmount: number;
  visitorId: string;
  eventId: string;
  eventTickets: EventTicketResponse[];
  visitor?: VisitorResponse;
  event?: EventResponse;
}

export interface CreateEventTicketTransactionData {
  eventDate: Date;
  purchaseDate: Date;
  totalAmount: number;
  visitorId: string;
  eventId: string;
  tickets: CreateEventTicketData[];
}

export interface EventTicketResponse {
  id: string;
  price: number;
  status: EventTicketStatusEnum;
  eventTicketListingId: string;
  eventTicketTransactionId: string;
  eventTicketListing?: EventTicketListingResponse;
  eventTicketTransaction?: EventTicketTransactionResponse;
}

export interface CreateEventTicketData {
  listingId: string;
  quantity: number;
}

export interface UpdateEventTicketStatusData {
  status: EventTicketStatusEnum;
}

export interface CreateEventTicketTransactionPaymentIntentResponse {
  clientSecret: string;
  id: string;
}

export interface FetchEventTicketTransactionStripeKeyResponse {
  publishableKey: string;
}

export interface FetchEventTicketTransactionPaymentResponse {
  amount: number;
  description: string;
  status: string;
  secret: string;
}

export interface SendEventTicketTransactionEmailData {
  transactionId: string;
  recipientEmail: string;
}
