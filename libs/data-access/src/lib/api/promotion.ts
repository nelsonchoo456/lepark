import axios, { AxiosResponse } from 'axios';
import { PromotionResponse, PromotionData } from '../types/promotion';
import client from './client';

const URL = '/promotions';

export async function createPromotion(data: PromotionData, files?: File[]): Promise<AxiosResponse<PromotionResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images = uploadedUrls.data.uploadedUrls;
    } else {
      data.images = [];
    }

    const response: AxiosResponse<PromotionResponse> = await client.post(`${URL}/createPromotion`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw new Error(error.response.data.error);
    } else {
      throw error;
    }
  }
}

export async function getAllPromotions(archived?: boolean, enabled?: boolean): Promise<AxiosResponse<PromotionResponse[]>> {
  try {
    const params: Record<string, any> = {};
    if (archived !== undefined) {
      params.archived = archived; // Add `archived` to the query if defined
    }
    if (enabled !== undefined) {
      params.enabled = enabled; // Add `enabled` to the query if defined
    }

    const response: AxiosResponse<PromotionResponse[]> = await client.get(`${URL}/getAllPromotions`, { params });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPromotionById(id: string): Promise<AxiosResponse<PromotionResponse>> {
  try {
    const response: AxiosResponse<PromotionResponse> = await client.get(`${URL}/getPromotionById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPromotionsByParkId(parkId: string, archived?: boolean, enabled?: boolean): Promise<AxiosResponse<PromotionResponse[]>> {
  try {
    const params: Record<string, any> = {};
    if (archived !== undefined) {
      params.archived = archived; // Add `archived` to the query if defined
    }
    if (enabled !== undefined) {
      params.enabled = enabled; // Add `enabled` to the query if defined
    }

    const response: AxiosResponse<PromotionResponse[]> = await client.get(`${URL}/getAllPromotions?parkId=${parkId}&nparks=true`, { params });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePromotionDetails(
  id: string,
  data: Partial<PromotionData>,
  files?: File[],
): Promise<AxiosResponse<PromotionResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data?.images?.push(...uploadedUrls.data.uploadedUrls)
    }

    const response: AxiosResponse<PromotionResponse> = await client.put(`${URL}/updatePromotion/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deletePromotion(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deletePromotion/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}