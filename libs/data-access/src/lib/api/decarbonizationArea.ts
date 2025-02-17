import axios, { AxiosResponse } from 'axios';
import { DecarbonizationAreaData, DecarbonizationAreaResponse } from '../types/decarbonizationArea';
import client from './client';
import { OccurrenceResponse } from '../types/occurrence';

const URL = '/decarbonizationarea';

export async function createDecarbonizationArea(data: DecarbonizationAreaData): Promise<AxiosResponse<DecarbonizationAreaResponse>> {
  try {
    const response: AxiosResponse<DecarbonizationAreaResponse> = await client.post(`${URL}/createDecarbonizationArea`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getDecarbonizationAreaById(id: string): Promise<AxiosResponse<DecarbonizationAreaResponse>> {
  try {
    const response: AxiosResponse<DecarbonizationAreaResponse> = await client.get(`${URL}/getDecarbonizationAreaById/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function updateDecarbonizationArea(
  id: string,
  data: Partial<DecarbonizationAreaData>,
): Promise<AxiosResponse<DecarbonizationAreaResponse>> {
  try {
    const response: AxiosResponse<DecarbonizationAreaResponse> = await client.put(`${URL}/updateDecarbonizationArea/${id}`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteDecarbonizationArea(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteDecarbonizationArea/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getAllDecarbonizationAreas(): Promise<AxiosResponse<DecarbonizationAreaResponse[]>> {
  try {
    const response: AxiosResponse<DecarbonizationAreaResponse[]> = await client.get(`${URL}/getAllDecarbonizationAreas`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export const getDecarbonizationAreasByParkId = async (parkId: number) => {
  try {
    const response: AxiosResponse<DecarbonizationAreaResponse[]> = await client.get(`${URL}/${parkId}`);
    return response;
  } catch (error) {
    throw new Error('Error fetching decarbonization areas by park ID');
  }
};

export const getOccurrencesWithinDecarbonizationArea = async (areaId: string) => {
  try {
    const response: AxiosResponse<OccurrenceResponse[]> = await client.get(`${URL}/${areaId}/occurrences`);
    return response;
  } catch (error) {
    throw new Error('Error fetching occurrences within decarbonization area');
  }
};

export const generateSequestrationHistory = async (areaId: string): Promise<void> => {
  try {
    await client.post(`/sequestrationhistory/generateSequestrationHistory/${areaId}`);
  } catch (error) {
    throw new Error('Error generating sequestration history');
  }
};

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
