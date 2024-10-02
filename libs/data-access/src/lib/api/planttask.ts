import axios, { AxiosResponse } from 'axios';
import { PlantTaskData, PlantTaskResponse, PlantTaskUpdateData } from '../types/planttask';
import client from './client';

const URL = '/planttasks';

export async function createPlantTask(data: PlantTaskData, staffId: string, files?: File[]): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    console.log(data.images);
    const response: AxiosResponse<PlantTaskResponse> = await client.post(`${URL}/createPlantTask`, { ...data, submittingStaffId: staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllPlantTasks(): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getAllPlantTasks`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantTaskById(id: string): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const response: AxiosResponse<PlantTaskResponse> = await client.get(`${URL}/viewPlantTaskDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePlantTaskDetails(id: string, data: PlantTaskUpdateData, files?: File[]): Promise<AxiosResponse<PlantTaskResponse>> {
  try {

    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file); // The key 'files' matches what Multer expects
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images?.push(...uploadedUrls.data.uploadedUrls);
    }

    const response: AxiosResponse<PlantTaskResponse> = await client.put(`${URL}/updatePlantTaskDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deletePlantTask(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deletePlantTask/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantTasksByParkId(parkId: number): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getPlantTasksByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
