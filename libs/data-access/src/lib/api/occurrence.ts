import axios, { AxiosResponse } from 'axios';
import { OccurrenceData, OccurrenceResponse, OccurrenceUpdateData } from '../types/occurrence';
import client from './client';
import { ActivityLogResponse } from '../types/activitylog';

const URL = '/occurrences';
const URL_SPECIES = '/species';
const URL_ACTIVITY_LOGS = '/activityLogs';

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
    const response: AxiosResponse<ActivityLogResponse[]> = await client.get(`${URL_ACTIVITY_LOGS}/viewActivityLogs/${occurrenceId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
