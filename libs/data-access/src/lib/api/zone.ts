import axios, { AxiosResponse } from 'axios';
import { ZoneData, ZoneResponse } from '../types/zone';
import client from './client';

const URL = '/zones';

// Remove the axiosClient creation

export async function createZone(data: ZoneData, files?: File[]): Promise<AxiosResponse<ZoneResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file);
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<ZoneResponse> = await client.post(`${URL}/createZone`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getAllZones(): Promise<AxiosResponse<ZoneResponse[]>> {
  try {
    const response: AxiosResponse<ZoneResponse[]> = await client.get(`${URL}/getAllZones`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getZonesByParkId(parkId: number): Promise<AxiosResponse<ZoneResponse[]>> {
  try {
    const response: AxiosResponse<ZoneResponse[]> = await client.get(`${URL}/getAllZones`, { params: { parkId } });
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function getZoneById(id: number): Promise<AxiosResponse<ZoneResponse>> {
  try {
    const response: AxiosResponse<ZoneResponse> = await client.get(`${URL}/getZoneById/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function updateZone(id: number, data: Partial<ZoneResponse>, files?: File[]): Promise<AxiosResponse<ZoneResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images?.push(...uploadedUrls.data.uploadedUrls);
    }
    
    const response: AxiosResponse<ZoneResponse> = await client.put(`${URL}/updateZone/${id}`, data);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

export async function deleteZone(id: number): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteZone/${id}`);
    return response;
  } catch (error) {
    handleAxiosError(error);
  }
}

function handleAxiosError(error: any): never {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      if (error.response.status === 409) {
        throw new Error('A zone with this name already exists');
      } else if (error.response.status === 400) {
        throw new Error(error.response.data.error || 'Bad Request');
      } else {
        throw new Error(error.response.data.error || 'An error occurred');
      }
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error('Error setting up the request');
    }
  } else {
    throw new Error('An unexpected error occurred');
  }
}