import axios, { AxiosResponse } from 'axios';
import { SpeciesResponse } from '../types/species';
import client from './client';

export async function createSpecies(data: SpeciesResponse): Promise<AxiosResponse<SpeciesResponse>> {
  try {
    const response: AxiosResponse<SpeciesResponse> = await client.post('/createSpecies', data);
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
    const response: AxiosResponse<SpeciesResponse[]> = await client.get('/getAllSpecies');
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
    const response: AxiosResponse<SpeciesResponse> = await client.get(`/viewSpeciesDetails/${id}`);
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
    const response: AxiosResponse<SpeciesResponse> = await client.put(`/updateSpeciesDetails/${id}`, data);
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
    const response: AxiosResponse<void> = await client.delete(`/deleteSpecies/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
