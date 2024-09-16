import axios, { AxiosResponse } from 'axios';
import { ParkData, ParkResponse } from '../types/park';
import client from './client';
const URL = '/parks';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/parks', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

export async function createPark(data: ParkData, files?: File[]): Promise<AxiosResponse<ParkResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    console.log( data.images );
    const response: AxiosResponse<ParkResponse> = await axiosClient.post('/createPark', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllParks(): Promise<AxiosResponse<ParkResponse[]>> {
  try {
    const response: AxiosResponse<ParkResponse[]> = await axiosClient.get(`/getAllParks`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkById(id: number): Promise<AxiosResponse<ParkResponse>> {
  try {
    const response: AxiosResponse<ParkResponse> = await axiosClient.get(`/getParkById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePark(id: number, data: Partial<ParkResponse>, files?: File[]): Promise<AxiosResponse<ParkResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file); // The key 'files' matches what Multer expects
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images?.push(...uploadedUrls.data.uploadedUrls);
    }
    
    const response: AxiosResponse<ParkResponse> = await axiosClient.put(`/updatePark/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getRandomParkImage(): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string[]> = await axiosClient.get(`/getRandomParkImage`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deletePark(id: number): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await axiosClient.delete(`/deletePark/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
