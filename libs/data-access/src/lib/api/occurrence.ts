import axios, { AxiosResponse } from 'axios';
import { OccurrenceData, OccurrenceResponse, OccurrenceUpdateData } from '../types/occurrence';
import client from './client';
import { ActivityLogResponse } from '../types/activitylog';

const URL = '/occurrences';
const URL_SPECIES = '/species';
const URL_ACTIVITY_LOGS = '/activityLogs';

export async function createOccurrence(data: OccurrenceData, files?: File[]): Promise<AxiosResponse<OccurrenceResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    console.log(data.images);
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

export async function getOccurrencesByParkId(parkId: number): Promise<AxiosResponse<OccurrenceResponse[]>> {
  try {
    const response: AxiosResponse<OccurrenceResponse[]> = await client.get(`${URL}/getAllOccurrences?parkId=${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getOccurrencesByZoneId(zoneId: number): Promise<AxiosResponse<OccurrenceResponse[]>> {
  try {
    const response: AxiosResponse<OccurrenceResponse[]> = await client.get(`${URL}/getAllOccurrences?zoneId=${zoneId}`);
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

export async function updateOccurrenceDetails(
  id: string,
  data: OccurrenceUpdateData,
  files?: File[],
): Promise<AxiosResponse<OccurrenceResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file); // The key 'files' matches what Multer expects
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images?.push(...uploadedUrls.data.uploadedUrls);
    }

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

export async function deleteOccurrence(id: string, userId: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteOccurrence/${id}`, {
      data: { requesterId: userId }, // Send requesterId in the body
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
