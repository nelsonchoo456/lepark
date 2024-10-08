export enum AttractionTicketStatusEnum {
  VALID = 'VALID',
  INVALID = 'INVALID',
  USED = 'USED',
}

export interface AttractionTicketTransactionResponse {
  id: string;
  visitorId: string;
  attractionId: string;
  totalAmount: number;
  transactionDate: Date;
  paymentStatus: string;
  tickets: AttractionTicketResponse[];
}

export interface CreateAttractionTicketTransactionData {
  visitorId: string;
  attractionId: string;
  totalAmount: number;
  tickets: CreateAttractionTicketData[];
}

export interface AttractionTicketResponse {
  id: string;
  transactionId: string;
  listingId: string;
  status: AttractionTicketStatusEnum;
  validFrom: Date;
  validTo: Date;
}

export interface CreateAttractionTicketData {
  listingId: string;
  validFrom: Date;
  validTo: Date;
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
