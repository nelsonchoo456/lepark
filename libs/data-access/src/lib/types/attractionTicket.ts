import { AttractionResponse, AttractionTicketListingResponse } from './attraction';
import { VisitorResponse } from './visitor';

export enum AttractionTicketStatusEnum {
  VALID = 'VALID',
  INVALID = 'INVALID',
  USED = 'USED',
}

export interface AttractionTicketTransactionResponse {
  id: string;
  attractionDate: Date;
  purchaseDate: Date;
  totalAmount: number;
  visitorId: string;
  attractionId: string;
  attractionTickets: AttractionTicketResponse[];
  visitor?: VisitorResponse;
  attraction?: AttractionResponse;
}

export interface CreateAttractionTicketTransactionData {
  attractionDate: Date;
  purchaseDate: Date;
  totalAmount: number;
  visitorId: string;
  attractionId: string;
  tickets: CreateAttractionTicketData[];
}

export interface AttractionTicketResponse {
  id: string;
  status: AttractionTicketStatusEnum;
  attractionTicketListingId: string;
  attractionTicketTransactionId: string;
  attractionTicketListing?: AttractionTicketListingResponse;
  attractionTicketTransaction?: AttractionTicketTransactionResponse;
}

export interface CreateAttractionTicketData {
  listingId: string;
  quantity: number;
}

export interface UpdateAttractionTicketStatusData {
  status: AttractionTicketStatusEnum;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  id: string;
}

export interface StripeKeyResponse {
  publishableKey: string;
}

export interface FetchPaymentResponse {
  amount: number;
  description: string;
  status: string;
  secret: string;
}

export interface SendAttractionTicketEmailData {
  transactionId: string;
  recipientEmail: string;
}
