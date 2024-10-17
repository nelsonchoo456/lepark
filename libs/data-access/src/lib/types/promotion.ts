import { ParkResponse } from "./park";

export enum DiscountTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}
export enum PromotionStatusEnum {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export interface PromotionResponse {
  id: string;
  name: string;
  description?: string;
  promoCode?: string;
  isNParksWide: boolean;
  parkId?: number;
  discountValue: number;
  images?: string[];
  validFrom: any;
  validUntil: any;
  status: PromotionStatusEnum;
  terms: string[];
  maximumUsage?: number;
  minimumAmount?: number;
  discountType:  DiscountTypeEnum;
  park?: ParkResponse
}

export interface PromotionData {
  name: string;
  description?: string;
  promoCode?: string;
  isNParksWide: boolean;
  parkId?: number;
  discountValue: number;
  images?: string[];
  validFrom: any;
  validUntil: any;
  status: PromotionStatusEnum;
  terms: string[];
  maximumUsage?: number;
  minimumAmount?: number;
  discountType:  DiscountTypeEnum;
}
