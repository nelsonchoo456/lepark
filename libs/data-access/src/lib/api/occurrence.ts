import axios, { AxiosResponse } from 'axios';
import { OccurrenceData, OccurrenceResponse, OccurrenceUpdateData, ActivityLogData, ActivityLogResponse, ActivityLogUpdateData } from '../types/occurrence';
import client from './client';

const URL = '/occurrences';
const URL_SPECIES = '/species';

export async function createOccurrence(data: OccurrenceData): Promise<AxiosResponse<OccurrenceResponse>> {
  try {
    const response: AxiosResponse<OccurrenceResponse> = await client.post(`${URL}/createOccurrence`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllOccurrences(): Promise<AxiosResponse<OccurrenceResponse[]>> {
  try {
    const response: AxiosResponse<OccurrenceResponse[]> = await client.get(`${URL}/getAllOccurrences`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getOccurrenceById(id: string): Promise<AxiosResponse<OccurrenceResponse>> {
  try {
    const response: AxiosResponse<OccurrenceResponse> = await client.get(`${URL}/viewOccurrenceDetails/${id}`);
    console.log(response.data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSpeciesNameById(id: string): Promise<AxiosResponse<string>> {
  try {
    const response: AxiosResponse<string> = await client.get(`${URL_SPECIES}/getSpeciesNameById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateOccurrenceDetails(id: string, data: OccurrenceUpdateData): Promise<AxiosResponse<OccurrenceResponse>> {
  try {
    const response: AxiosResponse<OccurrenceResponse> = await client.put(`${URL}/updateOccurrenceDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getActivityLogsByOccurrenceId(occurrenceId: string): Promise<AxiosResponse<ActivityLogResponse[]>> {
  try {
    const response: AxiosResponse<ActivityLogResponse[]> = await client.get(`${URL}/viewActivityLogs/${occurrenceId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

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
