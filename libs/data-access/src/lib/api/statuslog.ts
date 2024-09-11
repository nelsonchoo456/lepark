import axios, { AxiosResponse } from 'axios';
import client from './client';
import { StatusLogData, StatusLogResponse, StatusLogUpdateData } from '../types/statuslog';

const URL = '/statuslogs';

export async function createStatusLog(data: StatusLogData): Promise<AxiosResponse<StatusLogResponse>> {
  try {
    const response: AxiosResponse<StatusLogResponse> = await client.post(`${URL}/createStatusLog`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getStatusLogsByOccurrenceId(occurrenceId: string): Promise<AxiosResponse<StatusLogResponse[]>> {
  try {
    const response: AxiosResponse<StatusLogResponse[]> = await client.get(`${URL}/viewStatusLogs/${occurrenceId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getStatusLogById(id: string): Promise<AxiosResponse<StatusLogResponse>> {
  try {
    const response: AxiosResponse<StatusLogResponse> = await client.get(`${URL}/viewStatusLogDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateStatusLog(id: string, data: StatusLogUpdateData): Promise<AxiosResponse<StatusLogResponse>> {
  try {
    const response: AxiosResponse<StatusLogResponse> = await client.put(`${URL}/updateStatusLog/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteStatusLog(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteStatusLog/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
