import { Attraction } from '@prisma/client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { CreateAttractionData, UpdateAttractionData } from '../types/attraction';
import client from './client';

const URL = '/attractions';

export async function createAttraction(data: CreateAttractionData, files?: File[]): Promise<AxiosResponse<Attraction>> {
  try {
    const formData = new FormData();
    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<Attraction> = await client.post(`${URL}/createAttraction`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllAttractions(): Promise<AxiosResponse<Attraction[]>> {
  try {
    const response: AxiosResponse<Attraction[]> = await client.get(`${URL}/getAllAttractions`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAttractionById(id: string): Promise<AxiosResponse<Attraction>> {
  try {
    const response: AxiosResponse<Attraction> = await client.get(`${URL}/viewAttractionDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateAttractionDetails(id: string, updateData: UpdateAttractionData): Promise<AxiosResponse<Attraction>> {
  try {
    const response: AxiosResponse<Attraction> = await client.put(`${URL}/updateAttractionDetails/${id}`, updateData);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteAttraction(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteAttraction/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function uploadImages(files: File[]): Promise<AxiosResponse<{ uploadedUrls: string[] }>> {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response: AxiosResponse<{ uploadedUrls: string[] }> = await client.post(`${URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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