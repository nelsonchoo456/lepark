import axios, { AxiosResponse } from 'axios';
import { CreateSpeciesData, SpeciesResponse } from '../types/species';
import client from './client';
const URL = '/species';

export async function createSpecies(data: CreateSpeciesData): Promise<AxiosResponse<SpeciesResponse>> {
  try {
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
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function viewSpeciesDetails(id: string): Promise<AxiosResponse<SpeciesResponse>> {
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
