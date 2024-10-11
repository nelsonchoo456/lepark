import { FAQStatusEnum, FAQCategoryEnum } from './sharedenums';

export interface FAQCreateData {
  category: FAQCategoryEnum;
  question: string;
  answer: string;
  status: FAQStatusEnum;
  parkId: number;
  priority?: number;
}

export interface FAQUpdateData {
  category?: FAQCategoryEnum;
  question?: string;
  answer?: string;
  status?: FAQStatusEnum;
  parkId?: number;
  priority?: number;
}

export interface FAQResponse {
  id: string;
  category: FAQCategoryEnum;
  question: string;
  answer: string;
  status: FAQStatusEnum;
  parkId: number;
  priority?: number;
}
