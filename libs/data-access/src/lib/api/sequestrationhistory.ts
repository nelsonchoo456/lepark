import axios, { AxiosResponse } from 'axios';
import client from './client';
import { SequestrationHistory } from '@prisma/client';

const URL = '/sequestrationhistory';

export async function getSequestrationHistory(areaId: string): Promise<AxiosResponse<SequestrationHistory[]>> {
  try {
    const response: AxiosResponse<SequestrationHistory[]> = await client.get(`${URL}/area/${areaId}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function createSequestrationHistory(data: Omit<SequestrationHistory, 'id'>): Promise<AxiosResponse<SequestrationHistory>> {
  try {
    const response: AxiosResponse<SequestrationHistory> = await client.post(`${URL}`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function updateSequestrationHistory(
  id: string,
  data: Partial<SequestrationHistory>,
): Promise<AxiosResponse<SequestrationHistory>> {
  try {
    const response: AxiosResponse<SequestrationHistory> = await client.put(`${URL}/${id}`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteSequestrationHistory(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getSequestrationHistoryByAreaIdAndTimeFrame(
  areaId: string,
  startDate: string,
  endDate: string,
): Promise<AxiosResponse<SequestrationHistory[]>> {
  try {
    const response: AxiosResponse<SequestrationHistory[]> = await client.get(`${URL}/area/${areaId}/timeframe`, {
      params: { startDate, endDate },
    });
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getTotalSequestrationForParkAndDate(
  parkId: number,
  date: string
): Promise<AxiosResponse<{ totalSequestration: number }>> {
  try {
    const response: AxiosResponse<{ totalSequestration: number }> = await client.get(
      `${URL}/park/${parkId}/date/${date}`
    );
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
