import axios, { AxiosResponse } from 'axios';
import { ParkData, ParkResponse } from '../types/park';
import client from './client';
const URL = '/parks';

export async function createPark(data: ParkData, files?: File[]): Promise<AxiosResponse<ParkResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    console.log( data.images );
    const response: AxiosResponse<ParkResponse> = await client.post(`${URL}/createPark`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 409) {
          throw new Error('A park with this name already exists');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data.error || 'Bad Request');
        } else {
          throw new Error(error.response.data.error || 'An error occurred');
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error setting up the request');
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

export async function getAllParks(): Promise<AxiosResponse<ParkResponse[]>> {
  try {
    const response: AxiosResponse<ParkResponse[]> = await client.get(`${URL}/getAllParks`);
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
    const response: AxiosResponse<ParkResponse> = await client.get(`${URL}/getParkById/${id}`);
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
    
    const response: AxiosResponse<ParkResponse> = await client.put(`${URL}/updatePark/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 409) {
          throw new Error('A park with this name already exists');
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
}

export async function getRandomParkImage(): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string[]> = await client.get(`${URL}/getRandomParkImage`);
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
    const response: AxiosResponse<void> = await client.delete(`${URL}/deletePark/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
