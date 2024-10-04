export enum DiscountTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUND = 'FIXED_AMOUNT'
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
  isOneTime?: boolean;
  discountType:  DiscountTypeEnum;
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
  isOneTime?: boolean;
  discountType:  DiscountTypeEnum;
}

