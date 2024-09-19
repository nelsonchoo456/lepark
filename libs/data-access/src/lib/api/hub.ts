import axios, { AxiosResponse } from 'axios';
import { HubResponse } from '../types/hub';
import client from './client';

const URL = '/hubs';

export async function createHub(data: HubResponse, files?: File[]): Promise<AxiosResponse<HubResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file);
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<HubResponse> = await client.post(`${URL}/createHub`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllHubs(): Promise<AxiosResponse<HubResponse[]>> {
  try {
    const response: AxiosResponse<HubResponse[]> = await client.get(`${URL}/getAllHubs`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getHubById(id: string): Promise<AxiosResponse<HubResponse>> {
  try {
    const response: AxiosResponse<HubResponse> = await client.get(`${URL}/getHubById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateHubDetails(id: string, data: Partial<HubResponse>, files?: File[]): Promise<AxiosResponse<HubResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images = uploadedUrls.data.uploadedUrls;
    }

    const response: AxiosResponse<HubResponse> = await client.put(`${URL}/updateHubDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteHub(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteHub/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}