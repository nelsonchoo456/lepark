import axios, { AxiosResponse } from 'axios';
import { CreateSpeciesData, SpeciesResponse } from '../types/species';
import client from './client';
import { OccurrenceResponse } from '../types/occurrence';
const URL = '/species';

export async function createSpecies(data: CreateSpeciesData, files: File[]): Promise<AxiosResponse<SpeciesResponse>> {
  try {
    const formData = new FormData();

    // Append files to FormData (using the key 'files' to match Multer)
    files.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;
    const response: AxiosResponse<SpeciesResponse> = await client.post(`${URL}/createSpecies`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllSpecies(): Promise<AxiosResponse<SpeciesResponse[]>> {
  try {
    const response: AxiosResponse<SpeciesResponse[]> = await client.get(`${URL}/getAllSpecies`);
    console.log(response);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSpeciesById(id: string): Promise<AxiosResponse<SpeciesResponse>> {
  try {
    const response: AxiosResponse<SpeciesResponse> = await client.get(`${URL}/viewSpeciesDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function updateSpecies(id: string, data: Partial<SpeciesResponse>): Promise<AxiosResponse<SpeciesResponse>> {
  try {
    const response: AxiosResponse<SpeciesResponse> = await client.put(`${URL}/updateSpeciesDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function deleteSpecies(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteSpecies/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getOccurrencesBySpeciesId(id: string): Promise<AxiosResponse<OccurrenceResponse[]>> {
  try {
    const response: AxiosResponse<OccurrenceResponse[]> = await client.get(`${URL}/getOccurrencesBySpeciesId/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
