import axios, { AxiosResponse } from 'axios';
import { FAQCreateData, FAQUpdateData, FAQResponse } from '../types/faq';
import client from './client';

const URL = '/faq';

export async function createFAQ(data: FAQCreateData): Promise<AxiosResponse<FAQResponse>> {
  try {
    const response: AxiosResponse<FAQResponse> = await client.post(`${URL}/createFAQ`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getFAQById(id: string): Promise<AxiosResponse<FAQResponse>> {
  try {
    const response: AxiosResponse<FAQResponse> = await client.get(`${URL}/getFAQById/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function updateFAQ(id: string, data: FAQUpdateData): Promise<AxiosResponse<FAQResponse>> {
  try {
    const response: AxiosResponse<FAQResponse> = await client.put(`${URL}/updateFAQ/${id}`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteFAQ(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteFAQ/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getAllFAQs(): Promise<AxiosResponse<FAQResponse[]>> {
  try {
    const response: AxiosResponse<FAQResponse[]> = await client.get(`${URL}/getAllFAQs`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getFAQsByParkId(parkId: number): Promise<AxiosResponse<FAQResponse[]>> {
  try {
    const response: AxiosResponse<FAQResponse[]> = await client.get(`${URL}/getFAQsByParkId/${parkId}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

function handleAxiosError(error: any): never {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error('Error setting up the request');
    }
  } else {
    throw new Error('An unexpected error occurred');
  }
}
