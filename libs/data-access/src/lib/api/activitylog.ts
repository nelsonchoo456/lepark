import axios, { AxiosResponse } from 'axios';
import client from './client';
import { ActivityLogData, ActivityLogResponse, ActivityLogUpdateData } from '../types/activitylog';

const URL = '/activitylogs';
// Activity Log functions
export async function createActivityLog(data: ActivityLogData): Promise<AxiosResponse<ActivityLogResponse>> {
    try {
      const response: AxiosResponse<ActivityLogResponse> = await client.post(`${URL}/createActivityLog`, data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        throw error.response.data.error;
      } else {
        throw error;
      }
    }
  }
  
  export async function getActivityLogById(id: string): Promise<AxiosResponse<ActivityLogResponse>> {
    try {
      const response: AxiosResponse<ActivityLogResponse> = await client.get(`${URL}/viewActivityLogDetails/${id}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data.error || error.message;
      } else {
        throw error;
      }
    }
  }
  
  export async function updateActivityLog(id: string, data: ActivityLogUpdateData): Promise<AxiosResponse<ActivityLogResponse>> {
    try {
      const response: AxiosResponse<ActivityLogResponse> = await client.put(`${URL}/updateActivityLog/${id}`, data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data.error || error.message;
      } else {
        throw error;
      }
    }
  }
  
  export async function deleteActivityLog(id: string): Promise<AxiosResponse<void>> {
    try {
      const response: AxiosResponse<void> = await client.delete(`${URL}/deleteActivityLog/${id}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data.error || error.message;
      } else {
        throw error;
      }
    }
  }